import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendFeedback } from '../services/api';

const Feedback = ({ metadata }) => {
    const [voted, setVoted] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleVote = async (isUpvote) => {
        setVoted(isUpvote ? 'up' : 'down');
        setSubmitted(true);

        const feedbackData = {
            rating: isUpvote,
            is_low_light: metadata.analysis?.is_low_light || false,
            input_brightness: metadata.analysis?.brightness || 0.0,
            output_brightness: 0.0
        };

        await sendFeedback(feedbackData);
    };

    return (
        <AnimatePresence mode="wait">
            {!submitted ? (
                <motion.div
                    key="voting"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="feedback-widget"
                >
                    <div className="feedback-header">
                        <Star size={16} className="feedback-star" />
                        <span>Rate this enhancement</span>
                    </div>

                    <div className="feedback-buttons">
                        <button
                            onClick={() => handleVote(true)}
                            className="feedback-btn good"
                            title="Good result"
                        >
                            <ThumbsUp size={18} />
                            <span>Good</span>
                        </button>

                        <button
                            onClick={() => handleVote(false)}
                            className="feedback-btn poor"
                            title="Needs improvement"
                        >
                            <ThumbsDown size={18} />
                            <span>Poor</span>
                        </button>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="thanks"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="feedback-thanks"
                >
                    <CheckCircle2 size={18} />
                    <span>Thanks for your feedback!</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Feedback;
