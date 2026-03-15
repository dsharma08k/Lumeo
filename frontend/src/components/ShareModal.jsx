
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, X } from 'lucide-react';
import { shareResult } from '../services/api';

const ShareModal = ({ isOpen, onClose, originalFile, enhancedBlob }) => {
    const [loading, setLoading] = useState(false);
    const [shareLink, setShareLink] = useState(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState(null);

    const handleShare = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await shareResult(originalFile, enhancedBlob);
            // Construct full URL
            const link = `${window.location.origin}/shared/${result.id}`;
            setShareLink(link);
        } catch (err) {
            console.error(err);
            setError("Failed to create share link.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="share-modal-overlay">
            <div className="share-modal-backdrop" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="share-modal-card"
            >
                <button
                    onClick={onClose}
                    className="share-modal-close"
                >
                    <X size={20} />
                </button>

                <h2 className="share-modal-title">
                    <Share2 size={24} color="var(--accent)" />
                    Share Result
                </h2>

                {!shareLink ? (
                    <div className="share-modal-body">
                        <p className="share-modal-description">
                            Create a public link to share your before/after comparison with others.
                        </p>
                        {error && <p className="share-modal-error">{error}</p>}

                        <button
                            className="glow-btn"
                            onClick={handleShare}
                            disabled={loading}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {loading ? 'Creating Link...' : 'Generate Public Link'}
                        </button>
                    </div>
                ) : (
                    <div className="share-link-section">
                        <p className="share-link-label">Your share link:</p>
                        <div className="share-link-row">
                            <input
                                readOnly
                                value={shareLink}
                                className="share-link-input"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="share-link-copy"
                            >
                                {copied ? <Check size={16} color="#000" /> : <Copy size={16} color="#000" />}
                            </button>
                        </div>
                        <p className="share-link-note">
                            Anyone with this link can view this result.
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ShareModal;
