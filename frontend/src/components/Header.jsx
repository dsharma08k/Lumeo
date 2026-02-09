import React from 'react';
import { HelpCircle } from 'lucide-react';

const Header = ({ onHelpClick }) => {
    return (
        <header className="app-header">
            <div className="header-left">
                <img src="/lumeo.svg" alt="Lumeo" className="logo-img" />
                <h1 className="header-title">Lumeo</h1>
                <span className="beta-tag">BETA</span>
            </div>
            <div className="header-right">
                <button className="help-button-header" onClick={onHelpClick} title="How to use">
                    <HelpCircle size={18} />
                </button>
            </div>
        </header>
    );
};

export default Header;
