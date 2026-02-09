
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from backend.core.model import model_manager
from backend.core.image import process_image, tensor_to_bytes, analyze_brightness
from backend.core.db import supabase
from pydantic import BaseModel
from typing import Optional
import io
import magic
from PIL import Image
import base64
import logging
from datetime import datetime
import psutil
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger("lumeo")

# Configuration
# Configuration
import os
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", 10))
MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024
MAX_DIMENSION = int(os.getenv("MAX_IMAGE_DIMENSION", 4096))
ALLOWED_TYPES = ["image/jpeg", "image/png"]

def validate_file_size(file_size: int) -> None:
    """Validate file size"""
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
        )

def validate_image_type(contents: bytes) -> str:
    """Validate image MIME type using file magic numbers"""
    try:
        mime_type = magic.from_buffer(contents, mime=True)
        if mime_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_TYPES)}"
            )
        return mime_type
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid image file")

def validate_image_dimensions(contents: bytes) -> tuple:
    """Validate image dimensions"""
    try:
        img = Image.open(io.BytesIO(contents))
        width, height = img.size
        
        if width > MAX_DIMENSION or height > MAX_DIMENSION:
            raise HTTPException(
                status_code=400,
                detail=f"Image dimensions too large. Maximum: {MAX_DIMENSION}x{MAX_DIMENSION}px"
            )
        
        return width, height
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid image file")

@router.post("/enhance_v2")
@limiter.limit("10/minute")
async def enhance_image(request: Request, file: UploadFile = File(...)):
    """
    Enhance a low-light image with proper validation.
    """
    logger.info("enhance_image endpoint called")
    
    # Read file in chunks to prevent memory issues
    file_size = 0
    chunks = []
    
    try:
        while chunk := await file.read(8192):  # 8KB chunks
            file_size += len(chunk)
            validate_file_size(file_size)  # Check on each chunk
            chunks.append(chunk)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error reading file")
    
    contents = b''.join(chunks)
    
    # Validate file type using magic numbers
    mime_type = validate_image_type(contents)
    
    # Validate image dimensions
    width, height = validate_image_dimensions(contents)
    
    logger.info(f"Valid image: {mime_type}, {width}x{height}, {file_size/1024:.1f}KB")
    
    try:
        # Preprocess
        input_tensor = process_image(contents)
        
        # Inference
        output_tensor = model_manager.predict(input_tensor)
        
        # Determine format
        fmt = "JPEG" if mime_type == "image/jpeg" else "PNG"
        
        # Convert tensor to bytes
        img_bytes = tensor_to_bytes(output_tensor, format=fmt)
        
        # Encode to base64
        base64_encoded_image = base64.b64encode(img_bytes).decode('utf-8')
        
        return JSONResponse({
            "image": base64_encoded_image,
            "format": fmt.lower(),
            "original_size": {"width": width, "height": height}
        })
    
    except Exception as e:
        logger.error(f"Enhancement failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Image enhancement failed")

@router.post("/analyze")
@limiter.limit("30/minute")
async def analyze_image_endpoint(request: Request, file: UploadFile = File(...)):
    """
    Analyze if an image is low-light.
    """
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    try:
        contents = await file.read()
        tensor = process_image(contents)
        result = analyze_brightness(tensor)
        return result
    except Exception as e:
        logger.error(f"Error analyzing image: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

class FeedbackRequest(BaseModel):
    rating: bool  # True (Up) / False (Down)
    is_low_light: bool
    inference_time_ms: Optional[float] = None
    input_brightness: float
    output_brightness: float

@router.post("/feedback")
async def submit_feedback(feedback: FeedbackRequest):
    """
    Store user feedback and metadata in Supabase.
    """
    try:
        from backend.config import SUPABASE_URL
        if "your-project" in SUPABASE_URL or not SUPABASE_URL:
            return {"status": "skipped", "message": "Supabase not configured"}

        data = feedback.dict()
        response = supabase.table("feedback").insert(data).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        # Don't block the UI if analytics (feedback) fails
        return {"status": "error", "message": str(e)}

@router.post("/share")
@limiter.limit("5/minute")
async def share_result(
    request: Request,
    original: UploadFile = File(...),
    enhanced: UploadFile = File(...)
):
    """
    Upload images to public storage and create a shareable link.
    """
    try:
        from backend.config import SUPABASE_URL
        if "your-project" in SUPABASE_URL or not SUPABASE_URL:
            raise HTTPException(
                status_code=503, 
                detail="Sharing disabled. Please configure SUPABASE_URL in backend/.env"
            )

        import uuid
        import time
        
        # Generate unique paths
        req_id = str(uuid.uuid4())
        timestamp = int(time.time())
        orig_path = f"public/{req_id}_{timestamp}_orig.png"
        enh_path = f"public/{req_id}_{timestamp}_enh.png"
        
        # Upload Original
        orig_content = await original.read()
        supabase.storage.from_("lumeo-images").upload(
            orig_path, 
            orig_content, 
            {"content-type": "image/png"}
        )
        
        # Upload Enhanced
        enh_content = await enhanced.read()
        supabase.storage.from_("lumeo-images").upload(
            enh_path, 
            enh_content, 
            {"content-type": "image/png"}
        )
        
        # Get Public URLs
        orig_url = supabase.storage.from_("lumeo-images").get_public_url(orig_path)
        enh_url = supabase.storage.from_("lumeo-images").get_public_url(enh_path)
        
        # Insert into DB
        data = {
            "original_url": orig_url,
            "enhanced_url": enh_url
        }
        db_res = supabase.table("shared_results").insert(data).execute()
        
        return {"id": db_res.data[0]['id']}
        
    except Exception as e:
        logger.error(f"Error sharing result: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shared/{share_id}")
async def get_shared_result(share_id: str):
    """
    Retrieve shared result details.
    """
    try:
        response = supabase.table("shared_results").select("*").eq("id", share_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Shared result not found")
        return response.data[0]
    except Exception as e:
        logger.error(f"Error fetching shared result: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring.
    Returns service status, model status, and system metrics.
    """
    try:
        # Check model is loaded
        model_loaded = model_manager.model is not None
        
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        
        return {
            "status": "healthy" if model_loaded else "degraded",
            "timestamp": datetime.utcnow().isoformat(),
            "model": {
                "loaded": model_loaded,
                "device": str(next(model_manager.model.parameters()).device) if model_loaded else None
            },
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available_gb": memory.available / (1024**3)
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "error": "Health check failed"
        }
