// Production configuration and optimizations
(function() {
    'use strict';
    
    // Production environment detection
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1' && 
                        !window.location.hostname.includes('local');
    
    // Set global production flag
    window.SALMAN_PRODUCTION = isProduction;
    
    // Production optimizations
    if (isProduction) {
        // Disable right-click context menu for a more app-like feel
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
        
        // Disable text selection on UI elements
        document.addEventListener('selectstart', function(e) {
            if (e.target.tagName === 'BUTTON' || 
                e.target.classList.contains('zoom-btn') ||
                e.target.classList.contains('note')) {
                e.preventDefault();
            }
        });
        
        // Add production-only performance optimizations
        document.addEventListener('DOMContentLoaded', function() {
            // Preload critical images
            const imageUrls = [
                '/static/images/salman1.jpg',
                '/static/images/salman2.jpg',
                '/static/images/salman3.jpg'
            ];
            
            imageUrls.forEach(url => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = url;
                document.head.appendChild(link);
            });
            
            // Add subtle loading optimizations
            const notes = document.querySelectorAll('.note');
            if (notes.length > 20) {
                // Only animate first 20 notes to improve performance
                notes.forEach((note, index) => {
                    if (index >= 20) {
                        note.style.transition = 'none';
                    }
                });
            }
        });
    }
    
    // Global error handler for production
    if (isProduction) {
        window.addEventListener('error', function(e) {
            // Silently handle errors in production
            return true;
        });
        
        window.addEventListener('unhandledrejection', function(e) {
            // Silently handle promise rejections in production
            e.preventDefault();
        });
    }
})();