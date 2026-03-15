---
title: Lumeo Backend
emoji: 🌙
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Lumeo Backend API

Low-light image enhancement API powered by U-Net deep learning model.

## Endpoints

- `POST /api/v1/enhance_v2` - Enhance a low-light image
- `POST /api/v1/analyze` - Check if image is low-light
- `POST /api/v1/feedback` - Submit user rating
- `POST /api/v1/share` - Create shareable link
- `GET /api/v1/shared/{id}` - Get shared result
- `GET /api/v1/health` - Health and model status

## Environment Variables

Required for runtime:
- `DEVICE` (default: `cpu`)
- `ALLOWED_ORIGINS`

Optional (sharing and feedback only):
- `SUPABASE_URL`
- `SUPABASE_KEY`

Inference quality tuning (no retraining required):
- `MAX_INFER_SIZE` (default: `512`)
- `HIGHLIGHT_BLEND_STRENGTH` (default: `0.65`)
- `HIGHLIGHT_START` (default: `0.82`)
- `HIGHLIGHT_END` (default: `0.98`)
- `SHADOW_BLEND_STRENGTH` (default: `0.78`)
- `SHADOW_START` (default: `0.05`)
- `SHADOW_END` (default: `0.45`)
- `CLASSIC_SHADOW_GAMMA` (default: `0.72`)
- `CLASSIC_BLEND` (default: `0.55`)
- `OUTPUT_GAMMA` (default: `1.05`)

Notes:
- If Supabase credentials are missing/invalid, enhancement and analysis still work.
- Share and feedback persistence require valid Supabase credentials.
