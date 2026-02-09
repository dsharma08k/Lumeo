import React, { useEffect, useState } from 'react';
import '../index.css';

const Background = () => {
    const [dots, setDots] = useState([]);

    useEffect(() => {
        // Generate random dots
        const dotCount = 30; // More dots for effect
        const newDots = Array.from({ length: dotCount }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 10}s`, // Varied speed
            opacity: Math.random() * 0.5 + 0.1,
            size: `${Math.random() * 3 + 1}px`
        }));
        setDots(newDots);
    }, []);

    return (
        <div className="background-animation">
            {/* Pure black background, no gradient overlay unless specified */}
            {dots.map(dot => (
                <div
                    key={dot.id}
                    className="floating-dot"
                    style={{
                        left: dot.left,
                        top: dot.top,
                        width: dot.size,
                        height: dot.size,
                        opacity: dot.opacity,
                        animationDelay: dot.animationDelay,
                        animationDuration: dot.animationDuration
                    }}
                />
            ))}
        </div>
    );
};

export default Background;
