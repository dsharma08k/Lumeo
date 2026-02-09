import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, ChevronRight } from 'lucide-react';

const ONBOARDING_STEPS = [
    {
        icon: "👋",
        title: "Welcome to Lumeo",
        description: "The AI-powered assistant that tracks your image's transformation. Stop guessing and start enhancing with confidence."
    },
    {
        icon: "📤",
        title: "Upload Your Photo",
        description: "Drag & drop your low-light photos. We support PNG, JPG, and JPEG formats for instant processing."
    },
    {
        icon: "✨",
        title: "AI Enhancement",
        description: "Our advanced U-Net model intelligently brightens and restores details without adding noise."
    },
    {
        icon: "🚀",
        title: "Share Results",
        description: "Get a sharable link to show off your before/after transformation to the world."
    }
];

const HelpModal = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    // Reset step when modal opens
    useEffect(() => {
        if (isOpen) setCurrentStep(0);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

    return (
        <div className="help-modal-overlay" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="help-modal onboarding-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="help-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="onboarding-content-wrapper">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="onboarding-step"
                        >
                            <div className="onboarding-icon">
                                {ONBOARDING_STEPS[currentStep].icon}
                            </div>
                            <h2 className="onboarding-title">
                                {ONBOARDING_STEPS[currentStep].title}
                            </h2>
                            <p className="onboarding-desc">
                                {ONBOARDING_STEPS[currentStep].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="onboarding-footer">
                    <div className="step-dots">
                        {ONBOARDING_STEPS.map((_, index) => (
                            <div
                                key={index}
                                className={`step-dot ${index === currentStep ? 'active' : ''}`}
                            />
                        ))}
                    </div>

                    <button className="onboarding-btn" onClick={handleNext}>
                        {isLastStep ? "Get Started" : "Next"}
                        {!isLastStep && <ChevronRight size={18} />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Help button component
export const HelpButton = ({ onClick }) => {
    return (
        <button className="help-button" onClick={onClick} title="How to use">
            <HelpCircle size={20} />
        </button>
    );
};

// Hook for first visit detection
export const useFirstVisit = () => {
    const [isFirstVisit, setIsFirstVisit] = useState(false);

    useEffect(() => {
        const hasVisited = localStorage.getItem('lumeo_visited');
        if (!hasVisited) {
            setIsFirstVisit(true);
            localStorage.setItem('lumeo_visited', 'true');
        }
    }, []);

    return isFirstVisit;
};

export default HelpModal;
