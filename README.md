---
title: Lumeo Backend
emoji: 🌓
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
app_port: 7860
---

# Lumeo - Low-Light Image Enhancement

![Banner](frontend/public/banner-placeholder.png)

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://lumeo-frontend.vercel.app)
[![GitHub](https://img.shields.io/badge/github-repo-blue)](https://github.com/dsharma08k/Lumeo)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)

**Lumeo** uses deep learning to breathe new life into dark, noisy photos. Built with a custom U-Net architecture trained on the LOL dataset, it uncovers hidden details in low-light conditions where traditional cameras fail.

---

##  Key Features

- **Deep Learning Enhancement**: Recovers color and detail from near-pitch-black images using a custom U-Net model.
- **Privacy-First**: Run inference locally or on your own server—no data leaves your control unless you want it to.
- **Fast Inference**: Optimized model delivers results in under 600ms on standard CPU hardware.
- **Apple-Inspired Dark UI**: Glass panels, subtle depth, and a cohesive dark visual language across all screens, cards, and buttons.
- **Animated Brand Motion**: Header logo includes a soft pulse + float animation for a premium feel.

---

##  Live Demo

**Try it here:** https://lumeo-frontend.vercel.app

**API Docs:** https://dsharma08k-lumeo-backend.hf.space/docs

![Demo GIF](frontend/public/demo.gif)

---

##  Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Accuracy (PSNR)** | ~22.3 dB | Peak Signal-to-Noise Ratio on LOL Dataset |
| **Structure (SSIM)** | ~0.84 | Structural Similarity Index |
| **Inference Time** | ~586 ms | Average on Standard CPU (No GPU) |
| **Model Size** | ~124 MB | 31M Parameters (Float32) |
| **Training Data** | LOL Dataset | 485 paired images |

---

##  Architecture

```mermaid
graph LR
    A[User] -->|Upload Image| B[React Frontend]
   B -->|POST /enhance_v2| C[FastAPI Backend]
    C -->|Input Tensor| D[Model Manager]
    D -->|Inference| E[U-Net Model]
   C -->|Adaptive Post-Processing| F[Shadow/Highlight Blending]
    E -->|Enhanced Tensor| D
   F -->|Final Image| C
    C -->|JSON Response| B
    B -->|Display| A
```

---

##  Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Custom CSS + Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI
- **ML/CV**: PyTorch, Torchvision, PIL, NumPy
- **Database**: Supabase (for optional feedback/logging)
- **Deployment**: Hugging Face Spaces (Docker)

### Machine Learning
- **Model**: U-Net (~31M params) with custom Encoder-Decoder blocks
- **Dataset**: LOL (Low-Light) Dataset
- **Loss Function**: Combined Loss (L1 + Perceptual VGG16 + SSIM)
- **Optimization**: AdamW with Cosine Annealing

---

##  Screenshots

### Main Interface
![Main Interface](frontend/public/screenshot-main.png)
*Clean dark-mode interface for distraction-free enhancement.*

### Comparison View
![Results](frontend/public/screenshot-results.png)
*Side-by-side comparison of original low-light and enhanced result in the updated Apple-style dark interface.*

---

##  Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dsharma08k/Lumeo.git
cd Lumeo
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Environment Variables

### 1. Local Development
Create a `.env` file in the `backend` directory:

```env
# Optional - For feedback logging
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Security
ALLOWED_ORIGINS=http://localhost:5173
MAX_FILE_SIZE_MB=10
MAX_IMAGE_DIMENSION=4096

# Inference quality tuning (no retraining)
MAX_INFER_SIZE=512
HIGHLIGHT_BLEND_STRENGTH=0.65
HIGHLIGHT_START=0.82
HIGHLIGHT_END=0.98
SHADOW_BLEND_STRENGTH=0.78
SHADOW_START=0.05
SHADOW_END=0.45
CLASSIC_SHADOW_GAMMA=0.72
CLASSIC_BLEND=0.55
OUTPUT_GAMMA=1.05

# Runtime
DEVICE=cpu
LOG_LEVEL=INFO
```

Notes:
- Supabase is optional for local development. If unset, enhancement and analysis still work.
- Sharing and feedback storage require valid Supabase credentials.

### 2. Production
#### Backend (Hugging Face Spaces)
For the live backend, **do not** commit `.env`. Instead, configure these in the Space's **Settings > Variables and secrets**.

| Name | Value | Type | Notes |
|------|-------|------|-------|
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Variable | **Crucial:** Must match your Vercel frontend URL so it can access the API. |
| `MAX_FILE_SIZE_MB` | `10` | Variable | |
| `MAX_IMAGE_DIMENSION` | `4096` | Variable | Maximum upload resolution |
| `MAX_INFER_SIZE` | `512` | Variable | Max side used during inference while preserving aspect ratio |
| `HIGHLIGHT_BLEND_STRENGTH` | `0.65` | Variable | Highlight recovery intensity |
| `SHADOW_BLEND_STRENGTH` | `0.78` | Variable | Model influence in dark regions |
| `CLASSIC_SHADOW_GAMMA` | `0.72` | Variable | Classical shadow-lift fallback gamma |
| `CLASSIC_BLEND` | `0.55` | Variable | Blend amount for classical fallback |
| `OUTPUT_GAMMA` | `1.05` | Variable | Final tone control |
| `LOG_LEVEL` | `WARNING` | Variable | |
| `SUPABASE_URL` | *your-supabase-url* | Secret | Optional (for feedback) |
| `SUPABASE_KEY` | *your-anon-key* | Secret | Optional (for feedback) |

#### Frontend (Vercel)
In your Vercel Project Settings > Environment Variables:

| Name | Value |
|------|-------|
| `VITE_API_BASE` | `https://<your-hf-username>-<space-name>.hf.space/api/v1` |

---

## Project Structure

```
Lumeo/
 backend/
    core/
       model.py         # U-Net Architecture & Manager
       image.py         # Image processing utils
    api/                 # FastAPI routes
    main.py              # Entry point
 frontend/
    src/
       components/      # UI Components
       App.jsx          # Main application
 models/
    lumeo_unet.pth       # Trained model weights
 notebooks/               # Training & Experimentation
 requirements.txt
```

---

##  How It Works

### 1. The U-Net Core
At the heart of Lumeo is a **U-Net** architecture. Originally designed for biomedical image segmentation, U-Net is excellent at retaining structural detail while transforming image content.
- **Encoder**: Compresses the image to capture "what" is in it (context).
- **Decoder**: Reconstructs the image to capture "where" things are (localization).
- **Skip Connections**: Bridge the encoder and decoder to preserve fine high-frequency details that are usually lost in deep networks.

### 2. Inference Pipeline (No-Retrain Updates)
- Uploads are resized with aspect ratio preserved and dimensions made divisible by 16.
- Model output is applied more strongly in shadows and more conservatively in bright areas.
- A hybrid classical gamma fallback is blended in dark regions for hard backlit scenes.
- Highlights are protected by blending with the original image to reduce washout.
- Final gamma tone control is applied before encoding the response.

### 3. Loss Function Magic
Training a low-light enhancer is tricky. Standard loss functions (like MSE) produce blurry results. We used a **Combined Loss**:
- **L1 Loss**: For pixel-perfect accuracy.
- **Perceptual Loss (VGG16)**: Ensures the image "looks" natural to the human eye by comparing high-level features.
- **SSIM Loss**: Preserves the structural information (edges, textures).

---

## Training Details

### Dataset
- **Source:** LOL (Low-Light) Dataset
- **Size:** 485 paired images (low-light + normal-light)
- **Split:** 470 train / 15 validation
- **Preprocessing:** Resized to 256x256 and converted to tensor in [0, 1]

### Hyperparameters
```python
batch_size = 8
learning_rate = 0.0002
epochs = 100
optimizer = AdamW
scheduler = CosineAnnealingLR
loss = L1 + 0.1*Perceptual + 0.1*SSIM
```

### Training Results
| Epoch | Train Loss | Val PSNR | Val SSIM |
|-------|-----------|----------|----------|
| 25    | 0.045     | 20.1 dB  | 0.78     |
| 50    | 0.032     | 21.5 dB  | 0.82     |
| 100   | 0.028     | 22.3 dB  | 0.84     |

Training time: ~8 hours on NVIDIA T4 GPU

---

##  Challenges & Solutions

### Challenge 1: Balacing Noise and Detail
**Problem**: Brightening a dark image amplifies the noise hidden in the shadows, resulting in a grainy mess.
**Solution**: We incorporated **Total Variation (TV) Regularization** and tuned the Perceptual Loss to penalize high-frequency noise artifacts without blurring essential details.
**Impact**: Cleaner enhancements that retain sharp edges.

### Challenge 2: Inference Latency on CPU
**Problem**: The full U-Net model was too heavy (~31M params) for real-time CPU inference.
**Solution**: We implemented a singleton `ModelManager` to load the model only once at startup and optimized the tensor operations.
**Impact**: Reduced cold-start latency from 8s to <1s, with average inference under 600ms.

---

##  Future Improvements

- [ ] **Video Support**: Frame-by-frame enhancement for low-light videos.
- [ ] **Mobile App**: Port model to ONNX for edge inference on React Native.
- [ ] **User Feedback Loop**: Reinforcement learning from user ratings to fine-tune the model.

---

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

##  Author

**Divyanshu Sharma**
- GitHub: [@dsharma08k](https://github.com/dsharma08k)
- LinkedIn: [Divyanshu Sharma](https://www.linkedin.com/in/dsharma08k/)
- Peerlist: [Divyanshu Sharma](https://peerlist.io/dsharma08k)
- Email: dsharma08k@gmail.com

---
## Acknowledgments

- **Dataset:** [LOL Dataset](https://daooshee.github.io/BMVC2018website/) by Chen Wei et al.
- **Inspiration:** RetinexNet paper for low-light enhancement
- **Framework:** PyTorch and FastAPI communities

---
** If you found this project helpful, please consider giving it a star!**
