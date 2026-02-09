
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                    background: 'var(--bg-dark)',
                    border: '1px solid var(--glass-border)',
                    padding: '2rem',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '400px',
                    position: 'relative',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}
            >
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Share2 size={24} color="var(--accent)" />
                    Share Result
                </h2>

                {!shareLink ? (
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Create a public link to share your before/after comparison with others.
                        </p>
                        {error && <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error}</p>}

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
                    <div style={{ marginTop: '1.5rem' }}>
                        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Your share link:</p>
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            alignItems: 'center'
                        }}>
                            <input
                                readOnly
                                value={shareLink}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    flex: 1,
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                onClick={copyToClipboard}
                                style={{ background: 'var(--accent)', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', display: 'flex' }}
                            >
                                {copied ? <Check size={16} color="#000" /> : <Copy size={16} color="#000" />}
                            </button>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
                            Anyone with this link can view this result.
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ShareModal;
