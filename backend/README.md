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

- `POST /api/v1/enhance` - Enhance a low-light image
- `POST /api/v1/analyze` - Check if image is low-light
- `POST /api/v1/feedback` - Submit user rating
- `POST /api/v1/share` - Create shareable link
- `GET /api/v1/shared/{id}` - Get shared result

## Environment Variables

Set these in HF Spaces secrets:
- `SUPABASE_URL`
- `SUPABASE_KEY`
