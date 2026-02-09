# Hugging Face Spaces Dockerfile for Lumeo Backend
FROM python:3.10-slim

# Create user with UID 1000
RUN useradd -m -u 1000 user

# Set working directory and permissions
WORKDIR /app

# Install system dependencies (libmagic for file validation)
RUN apt-get update && apt-get install -y \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Switch to non-root user
USER user
ENV PATH="/home/user/.local/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Copy requirements from backend
COPY --chown=user backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -v -r requirements.txt

# Copy backend code
COPY --chown=user backend/ backend/
COPY --chown=user models/ models/
# Create empty init if needed for models
RUN touch models/__init__.py

# Expose port
EXPOSE 7860

# Run application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
