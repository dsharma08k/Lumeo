import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const DropZone = ({ onFileSelect }) => {
    const [isDragActive, setIsDragActive] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            onFileSelect(files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
        >
            <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                accept="image/png, image/jpeg"
                onChange={handleChange}
            />

            <div className="dropzone-icon">
                <Upload size={32} />
            </div>

            <p className="dropzone-text">
                {isDragActive ? 'Drop here' : 'Upload low-light image'}
            </p>
            <span className="dropzone-hint">PNG, JPG up to 10MB</span>
        </motion.div>
    );
};

export default DropZone;
