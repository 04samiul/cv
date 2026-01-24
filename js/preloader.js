/* preloader.js - Preloader Animation Control */

(function() {
    'use strict';
    
    /**
     * Preloader module handles the initial page loading animation
     * Implements skeleton screen pattern for better perceived performance
     */
    const PreloaderModule = {
        preloader: null,
        minDisplayTime: 800, // Minimum time to show preloader (ms)
        startTime: Date.now(),
        
        /**
         * Initialize preloader functionality
         */
        init: function() {
            this.preloader = document.getElementById('preloader');
            
            if (!this.preloader) {
                console.error('Preloader element not found');
                return;
            }
            
            // Hide preloader when page is fully loaded
            if (document.readyState === 'complete') {
                this.hide();
            } else {
                window.addEventListener('load', () => this.hide());
            }
            
            // Fallback timeout to prevent infinite loading
            setTimeout(() => this.hide(), 5000);
        },
        
        /**
         * Hide preloader with smooth fade-out transition
         * Ensures minimum display time for smooth UX
         */
        hide: function() {
            const elapsedTime = Date.now() - this.startTime;
            const remainingTime = Math.max(0, this.minDisplayTime - elapsedTime);
            
            setTimeout(() => {
                if (this.preloader) {
                    this.preloader.classList.add('hidden');
                    
                    // Remove from DOM after transition completes
                    setTimeout(() => {
                        if (this.preloader && this.preloader.parentNode) {
                            this.preloader.parentNode.removeChild(this.preloader);
                        }
                    }, 500);
                }
            }, remainingTime);
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PreloaderModule.init());
    } else {
        PreloaderModule.init();
    }
})();