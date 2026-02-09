import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { sendFeedback } from '../services/api';

const ComparisonView = ({ original, enhanced, onShare, metadata }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [voted, setVoted] = useState(null);
    const containerRef = useRef(null);
    const isDragging = useRef(false);

    const handleMouseMove = (e) => {
        if (!isDragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    };

    const handleTouchMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    };

    const handleMouseDown = () => {
        isDragging.current = true;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = enhanced;
        link.download = 'lumeo_enhanced.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleVote = async (isGood) => {
        setVoted(isGood ? 'good' : 'poor');
        const feedbackData = {
            rating: isGood,
            is_low_light: metadata?.analysis?.is_low_light || false,
            input_brightness: metadata?.analysis?.brightness || 0.0,
            output_brightness: 0.0
        };
        await sendFeedback(feedbackData);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="comparison-view"
        >
            {/* Image Comparison */}
            <div
                ref={containerRef}
                className="comparison-container"
                onMouseDown={handleMouseDown}
                onTouchMove={handleTouchMove}
            >
                <img src={enhanced} alt="Enhanced" className="comparison-image" />

                <div className="comparison-overlay" style={{ width: `${sliderPosition}%` }}>
                    <img
                        src={original}
                        alt="Original"
                        className="comparison-image"
                        style={{
                            width: containerRef.current ? containerRef.current.offsetWidth : '100%',
                            maxWidth: 'none'
                        }}
                    />
                </div>

                <div className="slider-line" style={{ left: `${sliderPosition}%` }} />
                <div className="slider-handle" style={{ left: `${sliderPosition}%` }} />

                <span className="img-label label-left">Original</span>
                <span className="img-label label-right">Enhanced</span>
            </div>

            {/* Actions Row - buttons left, rating right */}
            <div className="actions-row">
                <div className="btn-group">
                    <button className="btn-minimal" onClick={handleDownload}>
                        <Download size={16} /> Download
                    </button>
                    {onShare && (
                        <button className="btn-minimal" onClick={onShare}>
                            <Share2 size={16} /> Share
                        </button>
                    )}
                </div>

                {/* Rating - right side */}
                <AnimatePresence mode="wait">
                    {!voted ? (
                        <motion.div
                            key="rate"
                            className="rating-group"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <span className="rating-label">Rate:</span>
                            <button className="rate-btn good" onClick={() => handleVote(true)} title="Good">
                                <ThumbsUp size={16} />
                            </button>
                            <button className="rate-btn poor" onClick={() => handleVote(false)} title="Poor">
                                <ThumbsDown size={16} />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.span
                            key="thanks"
                            className="thanks-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <Check size={14} /> Thanks!
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default ComparisonView;
