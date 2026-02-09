import axios from 'axios';

// Use env variable for production, fallback to localhost for dev
const API_Base = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';

export const analyzeImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_Base}/analyze`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const enhanceImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_Base}/enhance_v2`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    const data = response.data;
    console.log("Enhance Data:", data);

    const base64Image = data.image;
    const format = data.format || 'png';

    // Convert base64 to blob
    const byteCharacters = atob(base64Image);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: `image/${format}` });

    return {
        blob: blob
    };
};


export const sendFeedback = async (data) => {
    /*
      data = {
        rating: boolean,
        is_low_light: boolean,
        inference_time_ms: int,
        input_brightness: float,
        output_brightness: float
      }
    */
    try {
        await axios.post(`${API_Base}/feedback`, data);
    } catch (error) {
        console.warn("Feedback submission failed:", error); // Silent fail for UX
    }
}


export const shareResult = async (originalFile, enhancedBlob) => {
    const formData = new FormData();
    formData.append('original', originalFile);
    formData.append('enhanced', enhancedBlob, 'enhanced.png'); // Give it a filename

    const response = await axios.post(`${API_Base}/share`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data; // { id: "..." }
};

export const getSharedResult = async (id) => {
    const response = await axios.get(`${API_Base}/shared/${id}`);
    return response.data; // { original_url, enhanced_url, ... }
};
