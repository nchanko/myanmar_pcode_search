// Main application initialization and coordination

import { dataManager } from './data/dataManager.js';
import { searchController } from './search/searchController.js';
import { toggleButtons } from './ui/toggleButtons.js';
import { searchUI } from './ui/searchUI.js';
import { resultDisplay } from './ui/resultDisplay.js';

class MyanmarPcodeApp {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Initializing Myanmar PCode Search Application...');
            
            // Show loading indicator
            this.showLoadingIndicator();
            
            // Initialize data first
            await this.initializeData();
            
            // Initialize UI components
            this.initializeUI();
            
            // Setup map integration
            this.setupMapIntegration();
            
            // Hide loading indicator
            this.hideLoadingIndicator();
            
            this.initialized = true;
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showErrorMessage('Failed to load application data. Please refresh the page.');
        }
    }

    /**
     * Initialize data loading
     */
    async initializeData() {
        try {
            await dataManager.initializeData();
        } catch (error) {
            console.error('Data initialization failed:', error);
            throw new Error('Failed to load CSV data');
        }
    }

    /**
     * Initialize UI components
     */
    initializeUI() {
        // UI components are initialized in their constructors
        // This method ensures they are properly set up
        console.log('UI components initialized');
    }

    /**
     * Setup map integration event listeners
     */
    setupMapIntegration() {
        document.addEventListener('showOnMap', (e) => {
            const match = e.detail.match;
            if (match.Latitude && match.Longitude && typeof zoomToLocation === 'function') {
                zoomToLocation(match.Latitude, match.Longitude);
                if (typeof addSingleMarker === 'function') {
                    addSingleMarker(match);
                }
            }
        });
    }

    /**
     * Show loading indicator
     */
    showLoadingIndicator() {
        const existingIndicator = document.getElementById('loading-indicator');
        if (!existingIndicator) {
            const indicator = document.createElement('div');
            indicator.id = 'loading-indicator';
            indicator.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.9);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                ">
                    <div style="text-align: center;">
                        <div style="
                            width: 50px;
                            height: 50px;
                            border: 5px solid #f3f3f3;
                            border-top: 5px solid #3498db;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 20px;
                        "></div>
                        <p style="color: #333; font-size: 16px; margin: 0;">Loading Myanmar PCode data...</p>
                    </div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(indicator);
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoadingIndicator() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4757;
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 10001;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 400px;
            ">
                <strong>Error:</strong> ${message}
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    float: right;
                    margin-left: 10px;
                ">&times;</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 10000);
    }

    /**
     * Check if application is initialized
     */
    isInitialized() {
        return this.initialized;
    }
}

// Create application instance
const app = new MyanmarPcodeApp();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Export for global access if needed
window.MyanmarPcodeApp = app; 