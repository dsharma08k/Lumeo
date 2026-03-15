
import io
import torch
from PIL import Image
from torchvision import transforms
from backend.config import (
    MAX_INFER_SIZE,
    HIGHLIGHT_BLEND_STRENGTH,
    HIGHLIGHT_START,
    HIGHLIGHT_END,
    OUTPUT_GAMMA,
    SHADOW_BLEND_STRENGTH,
    SHADOW_START,
    SHADOW_END,
    CLASSIC_SHADOW_GAMMA,
    CLASSIC_BLEND,
)

# Define transformations
# 1. Convert to tensor
to_tensor = transforms.ToTensor()


def _resize_preserve_aspect(image: Image.Image, max_size: int = MAX_INFER_SIZE) -> Image.Image:
    """Resize while preserving aspect ratio and making dims divisible by 16 for U-Net."""
    width, height = image.size
    if width <= 0 or height <= 0:
        return image

    ratio = min(1.0, max_size / max(width, height))
    new_w = int(width * ratio)
    new_h = int(height * ratio)

    # U-Net pooling depth requires dimensions divisible by 16
    new_w = max(16, new_w - (new_w % 16))
    new_h = max(16, new_h - (new_h % 16))

    if (new_w, new_h) != (width, height):
        image = image.resize((new_w, new_h), Image.Resampling.LANCZOS)
    return image


def _recover_highlights(output: torch.Tensor, input_tensor: torch.Tensor) -> torch.Tensor:
    """Apply model output mostly in shadows and recover highlight detail from input."""
    if output.shape != input_tensor.shape:
        return output

    in_luma = (
        0.2126 * input_tensor[:, 0, :, :]
        + 0.7152 * input_tensor[:, 1, :, :]
        + 0.0722 * input_tensor[:, 2, :, :]
    )

    # Strong blend in dark regions, little/no blend in already bright regions.
    shadow_denom = max(SHADOW_END - SHADOW_START, 1e-6)
    shadow_mask = ((SHADOW_END - in_luma) / shadow_denom).clamp(0.0, 1.0).unsqueeze(1)
    shadow_alpha = (shadow_mask * SHADOW_BLEND_STRENGTH).clamp(0.0, 1.0)

    # Classical fallback for hard real-world scenes where model generalization is weak.
    classic_gamma = max(0.5, min(1.2, CLASSIC_SHADOW_GAMMA))
    classic = input_tensor.clamp(0.0, 1.0).pow(classic_gamma)
    classic_blend = max(0.0, min(1.0, CLASSIC_BLEND))
    hybrid_shadow = output * (1.0 - classic_blend) + classic * classic_blend

    mixed = input_tensor * (1.0 - shadow_alpha) + hybrid_shadow * shadow_alpha

    out_luma = (
        0.2126 * mixed[:, 0, :, :]
        + 0.7152 * mixed[:, 1, :, :]
        + 0.0722 * mixed[:, 2, :, :]
    )
    denom = max(HIGHLIGHT_END - HIGHLIGHT_START, 1e-6)
    highlight_mask = ((out_luma - HIGHLIGHT_START) / denom).clamp(0.0, 1.0).unsqueeze(1)
    blend = (highlight_mask * HIGHLIGHT_BLEND_STRENGTH).clamp(0.0, 1.0)

    merged = mixed * (1.0 - blend) + input_tensor * blend
    gamma = max(0.5, min(1.8, OUTPUT_GAMMA))
    return merged.clamp(0.0, 1.0).pow(gamma)

def process_image(image_bytes: bytes) -> torch.Tensor:
    """
    Convert bytes -> PIL -> Tensor [1, 3, H, W]
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    # For real-world photos, preserve aspect ratio instead of forcing a square warp.
    image = _resize_preserve_aspect(image, max_size=MAX_INFER_SIZE)
    tensor = to_tensor(image)
    return tensor.unsqueeze(0)  # Add batch dimension

def tensor_to_bytes(tensor: torch.Tensor, format: str = 'PNG', input_tensor: torch.Tensor | None = None) -> bytes:
    """
    Convert Tensor [1, 3, H, W] -> bytes
    """
    if input_tensor is not None:
        tensor = _recover_highlights(tensor, input_tensor)

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
