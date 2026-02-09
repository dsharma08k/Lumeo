
import io
import numpy as np
import torch
from PIL import Image
from torchvision import transforms
from backend.config import IMG_SIZE

# Define transformations
# 1. Resize to fixed size for model
# 2. Convert to tensor
transform_pipeline = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
])

def process_image(image_bytes: bytes) -> torch.Tensor:
    """
    Convert bytes -> PIL -> Tensor [1, 3, H, W]
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = transform_pipeline(image)
    return tensor.unsqueeze(0)  # Add batch dimension

def tensor_to_bytes(tensor: torch.Tensor, format: str = 'PNG') -> bytes:
    """
    Convert Tensor [1, 3, H, W] -> bytes
    """
    # Squeeze batch dimension if needed
    if tensor.dim() == 4:
        tensor = tensor.squeeze(0)
    
    # Clip to valid range [0, 1]
    tensor = torch.clamp(tensor, 0, 1)
    
    # Convert to PIL
    to_pil = transforms.ToPILImage()
    image = to_pil(tensor)
    
    # Save to bytes
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format=format)
    return img_byte_arr.getvalue()

def analyze_brightness(tensor: torch.Tensor) -> dict:
    """
    Analyze image brightness.
    Returns: {
        "brightness": float,
        "is_low_light": bool
    }
    """
    # Tensor is [1, 3, H, W] in range [0, 1]
    # Simple mean of all pixels
    brightness = tensor.mean().item()
    return {
        "brightness": brightness,
        "is_low_light": brightness < 0.3  # Threshold from Phase 1
    }
