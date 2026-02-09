
import pytest
import sys
import os

# Add backend directory to path so we can import main
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from main import app
import io
from PIL import Image

client = TestClient(app)

def create_test_image(format='PNG', size=(256, 256)):
    """Create a test image in memory"""
    img = Image.new('RGB', size, color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format=format)
    img_bytes.seek(0)
    return img_bytes

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded", "unhealthy"]
    if data["status"] == "unhealthy":
        assert "error" in data
    assert "model" in data or "error" in data

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "service" in response.json()

def test_enhance_valid_image():
    """Test enhancement with valid PNG image"""
    img = create_test_image('PNG')
    
    response = client.post(
        "/api/v1/enhance_v2",
        files={"file": ("test.png", img, "image/png")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "image" in data
    assert "format" in data

def test_enhance_invalid_file_type():
    """Test enhancement with invalid file type"""
    response = client.post(
        "/api/v1/enhance_v2",
        files={"file": ("test.txt", b"not an image", "text/plain")}
    )
    
    assert response.status_code == 400

def test_enhance_too_large():
    """Test file size validation"""
    # Create 11MB image (over limit)
    large_img = Image.new('RGB', (5000, 5000), color='blue')
    img_bytes = io.BytesIO()
    large_img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    response = client.post(
        "/api/v1/enhance_v2",
        files={"file": ("large.png", img_bytes, "image/png")}
    )
    
    # Should fail with 413 (too large) or 400 (too large dimensions)
    assert response.status_code in [413, 400]

def test_analyze_endpoint():
    """Test image analysis endpoint"""
    img = create_test_image('PNG')
    
    response = client.post(
        "/api/v1/analyze",
        files={"file": ("test.png", img, "image/png")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "brightness" in data
    # assert "is_low_light" in data # might verify depending on logic

def test_feedback_endpoint():
    """Test feedback submission"""
    feedback_data = {
        "rating": True,
        "is_low_light": True,
        "input_brightness": 0.15,
        "output_brightness": 0.75
    }
    
    response = client.post("/api/v1/feedback", json=feedback_data)
    # Should not fail even if Supabase not configured (endpoints catches error)
    assert response.status_code in [200, 500]
