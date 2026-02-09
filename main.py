import os
import logging
import time
from typing import List
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from api import endpoints
from core.model import model_manager

# Configure logging
# Configure logging
log_level = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, log_level, logging.INFO),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("lumeo")

app = FastAPI(
    title="Lumeo API",
    description="Low-light image enhancement backend",
    version="0.1.0"
)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/hour"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
def get_allowed_origins() -> List[str]:
    """Get allowed origins from environment"""
    env_origins = os.getenv("ALLOWED_ORIGINS", "")
    if env_origins:
        return [origin.strip() for origin in env_origins.split(",")]
    
    # Development defaults (remove in production)
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

origins = get_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all unhandled exceptions"""
    # Log detailed error server-side
    logger.error(
        f"Unhandled exception at {request.url.path}: {exc}",
        exc_info=True,
        extra={
            "path": request.url.path,
            "method": request.method,
            "client": request.client.host if request.client else None
        }
    )
    
    # Return generic error to client (don't expose stack traces)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error. Please try again later.",
            "error_id": f"{int(time.time())}"  # For tracking in logs
        }
    )

# Routes
app.include_router(endpoints.router, prefix="/api/v1", tags=["enhancement"])

@app.on_event("startup")
async def startup_event():
    # Warm up model
    model_manager.load_model()
    logger.info("Application started and model warmed up.")

@app.on_event("shutdown")
async def shutdown_event():
    # Clean up resources
    if model_manager.model:
        del model_manager.model
    import torch
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    logger.info("Application shutdown complete.")

@app.api_route("/", methods=["GET", "HEAD"])
def read_root():
    return {
        "service": "Lumeo API",
        "version": "0.1.0",
        "status": "running",
        "docs": "/docs",
        "health": "/api/v1/health"
    }
