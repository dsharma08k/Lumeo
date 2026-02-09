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
IMG_SIZE = 256

# Supabase settings
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
