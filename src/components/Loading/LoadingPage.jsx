import React from 'react';
import './LoadingPage.css';

function LoadingPage() {
    return (
        <div className="loading-container">
            <div className="bars-loader">
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>
        </div>
    );
}

export default LoadingPage;
