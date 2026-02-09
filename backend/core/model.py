
import torch
import sys
from pathlib import Path
from backend.config import MODEL_PATH, DEVICE

# Ensure the root directory is in sys.path to allow importing 'models'
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

try:
    from models.unet import UNet
except ImportError:
    # Fallback if running from a different context
    import sys
    sys.path.append(str(BASE_DIR))
    from models.unet import UNet

class ModelManager:
    _instance = None
    model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            # cls._instance.load_model() # Removed to allow lazy loading and avoid import-time error
        return cls._instance

    def load_model(self):
        if self.model is not None:
            return

        print(f"Loading model from {MODEL_PATH}...")
        try:
            # Initialize model architecture
            self.model = UNet()
            
            # Load weights
            # map_location=DEVICE ensures we can load CUDA weights on CPU if needed
            state_dict = torch.load(MODEL_PATH, map_location=torch.device(DEVICE))
            self.model.load_state_dict(state_dict)
            
            # Set to eval mode
            self.model.to(DEVICE)
            self.model.eval()
            print("Model loaded successfully!")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise e

    def predict(self, input_tensor):
        """
        Run inference on the input tensor.
        Input: [1, 3, H, W] tensor
        Output: [1, 3, H, W] tensor
        """
        if self.model is None:
            self.load_model()
            
        with torch.no_grad():
            input_tensor = input_tensor.to(DEVICE)
            output = self.model(input_tensor)
            return output.cpu()

model_manager = ModelManager()
