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

# Copy requirements from hfs_deploy
COPY --chown=user hfs_deploy/requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy application code from hfs_deploy (flattened structure)
COPY --chown=user hfs_deploy/ .
# Note: This copies main.py, config.py, api/, core/, models/ to /app/

# Expose port
EXPOSE 7860

# Run application (main.py is now at root of /app)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
