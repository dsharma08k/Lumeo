import React from 'react';
import { Github } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="app-footer">
            <a
                href="https://github.com/dsharma08k/Lumeo"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
            >
                <Github size={16} />
                View on GitHub
            </a>
            <span className="footer-divider">•</span>
            <span className="footer-text">© 2026 Lumeo</span>
        </footer>
    );
};

export default Footer;
