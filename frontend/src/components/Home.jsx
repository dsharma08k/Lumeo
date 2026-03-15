import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeImage, enhanceImage } from '../services/api';
import DropZone from '../components/DropZone';
import ComparisonView from '../components/ComparisonView';
import ShareModal from '../components/ShareModal';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HelpModal, { useFirstVisit } from '../components/HelpModal';
import { Loader2, AlertTriangle } from 'lucide-react';

function Home() {
    const [status, setStatus] = useState('idle');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [result, setResult] = useState(null);
    const [resultBlob, setResultBlob] = useState(null);
    const [error, setError] = useState(null);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    const isFirstVisit = useFirstVisit();

    // Show help modal on first visit
    React.useEffect(() => {
        if (isFirstVisit) {
            setIsHelpOpen(true);
        }
    }, [isFirstVisit]);

    const handleFileSelect = async (selectedFile) => {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setStatus('analyzing');
        setError(null);
        try {
            const result = await analyzeImage(selectedFile);
            setAnalysis(result);
            setStatus('ready');
        } catch (err) {
            console.error(err);
            setError("Failed to analyze image. Please try again.");
            setStatus('idle');
        }
    };

    const handleEnhance = async () => {
        if (!file) return;
        setStatus('enhancing');
        try {
            const response = await enhanceImage(file);
            const resultUrl = URL.createObjectURL(response.blob);
            setResult(resultUrl);
            setResultBlob(response.blob);
            setStatus('complete');
        } catch (err) {
            console.error(err);
            setError("Enhancement failed. Please check the backend.");
            setStatus('ready');
        }
    };

    const reset = () => {
        setFile(null);
        setPreview(null);
        setAnalysis(null);
        setResult(null);
        setResultBlob(null);
        setStatus('idle');
    };

    return (
        <>
            <Header onHelpClick={() => setIsHelpOpen(true)} />

            <main className="main-content">
                <div className="glass-panel">
                    <div className="panel-topbar">
                        {status !== 'idle' && (
                            <button
                                onClick={reset}
                                className="btn-minimal panel-reset-btn"
                            >
                                New Upload
                            </button>
                        )}
                    </div>

                    <div className="stage-container">
                        <AnimatePresence mode="wait">
                            {status === 'idle' && (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="drop-zone-container"
                                >
                                    <DropZone onFileSelect={handleFileSelect} />
                                </motion.div>
                            )}

                            {status === 'analyzing' && (
                                <motion.div
                                    key="analyzing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="state-card"
                                >
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                        <Loader2 size={48} color="var(--accent)" />
                                    </motion.div>
                                    <p className="state-text">Analyzing image...</p>
                                </motion.div>
                            )}

                            {status === 'ready' && (
                                <motion.div
                                    key="ready"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="ready-state"
                                >
                                    <div className="preview-card">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="preview-image"
                                        />
                                        {analysis && (
                                            <div className={`analysis-badge ${analysis.is_low_light ? 'analysis-badge-low' : 'analysis-badge-ok'}`}>
                                                {analysis.is_low_light ? (
                                                    <>
                                                        <AlertTriangle size={14} />
                                                        <span>Low Light Detected</span>
                                                    </>
                                                ) : (
                                                    <span>Lighting looks okay</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <button className="enhance-btn" onClick={handleEnhance}>
                                        Enhance Image
                                    </button>
                                </motion.div>
                            )}

                            {status === 'enhancing' && (
                                <motion.div
                                    key="enhancing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="enhancing-container"
                                >
                                    <div className="progress-ring">
                                        <Loader2 size={64} className="spin" color="var(--accent)" />
                                    </div>
                                    <div>
                                        <h2 className="enhancing-label">Enhancing your image...</h2>
                                        <p className="enhancing-sublabel">This usually takes 2-5 seconds</p>
                                    </div>
                                </motion.div>
                            )}

                            {status === 'complete' && result && (
                                <motion.div
                                    key="complete"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="result-state"
                                >
                                    <ComparisonView
                                        original={preview}
                                        enhanced={result}
                                        onShare={() => setIsShareOpen(true)}
                                        metadata={{ analysis }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="error-message"
                            >
                                <AlertTriangle size={18} />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />


            <AnimatePresence>
                {isHelpOpen && (
                    <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
                )}
            </AnimatePresence>

            <ShareModal
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                originalFile={file}
                enhancedBlob={resultBlob}
            />
        </>
    );
}

export default Home;
