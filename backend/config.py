import os
from pathlib import Path
from dotenv import load_dotenv

# Base project directory (one level up from backend)
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env (works for local dev, HF Spaces uses secrets)
env_path = BASE_DIR / "backend" / ".env"
if env_path.exists():
    load_dotenv(env_path)

# Model settings - HF Spaces puts files at /app/models/
# Check multiple possible locations
def get_model_path():
    possible_paths = [
        Path("/app/models/lumeo_unet.pth"),  # HF Spaces Docker
        BASE_DIR / "models" / "lumeo_unet.pth",  # Local dev
        Path("models/lumeo_unet.pth"),  # Relative path
    ]
    for path in possible_paths:
        if path.exists():
            return path
    # Default to the expected HF path
    return possible_paths[0]

MODEL_PATH = get_model_path()
DEVICE = os.getenv("DEVICE", "cpu")  # Can be overridden via env

# Image settings
IMG_SIZE = int(os.getenv("IMG_SIZE", 256))
MAX_INFER_SIZE = int(os.getenv("MAX_INFER_SIZE", 512))

# Post-processing settings (no-retrain quality tuning)
HIGHLIGHT_BLEND_STRENGTH = float(os.getenv("HIGHLIGHT_BLEND_STRENGTH", 0.65))
HIGHLIGHT_START = float(os.getenv("HIGHLIGHT_START", 0.82))
HIGHLIGHT_END = float(os.getenv("HIGHLIGHT_END", 0.98))
OUTPUT_GAMMA = float(os.getenv("OUTPUT_GAMMA", 1.05))
SHADOW_BLEND_STRENGTH = float(os.getenv("SHADOW_BLEND_STRENGTH", 0.78))
SHADOW_START = float(os.getenv("SHADOW_START", 0.05))
SHADOW_END = float(os.getenv("SHADOW_END", 0.45))
CLASSIC_SHADOW_GAMMA = float(os.getenv("CLASSIC_SHADOW_GAMMA", 0.72))
CLASSIC_BLEND = float(os.getenv("CLASSIC_BLEND", 0.55))

# Supabase settings
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
