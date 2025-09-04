// Retro Cursor Effects System
// Authentic 90s web experience with trailing cursors and sparkles

class RetroCursorSystem {
    constructor() {
        this.enabled = true;
        this.trails = [];
        this.sparkles = [];
        this.maxTrails = 8;
        this.maxSparkles = 15;
        this.mousePos = { x: 0, y: 0 };
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.createStyles();
        this.attachEventListeners();
        this.startAnimation();
    }

    createStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .cursor-trail {
                position: fixed;
                pointer-events: none;
                z-index: 9999;
                width: 8px;
                height: 8px;
                background: radial-gradient(circle, #FF1493, #FF69B4);
                border-radius: 50%;
                transition: all 0.1s ease-out;
                mix-blend-mode: difference;
            }

            .cursor-sparkle {
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                width: 4px;
                height: 4px;
                background: #FFD700;
                border-radius: 50%;
                animation: sparkle-fade 0.8s ease-out forwards;
                box-shadow: 0 0 6px #FFD700;
            }

            @keyframes sparkle-fade {
                0% {
                    opacity: 1;
                    transform: scale(1) rotate(0deg);
                }
                100% {
                    opacity: 0;
                    transform: scale(0) rotate(180deg);
                }
            }

            .cursor-star {
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                color: #FFFF00;
                font-size: 12px;
                animation: star-twinkle 1s ease-out forwards;
                text-shadow: 0 0 3px #FFFF00;
            }

            @keyframes star-twinkle {
                0% {
                    opacity: 1;
                    transform: scale(1) rotate(0deg);
                }
                50% {
                    opacity: 0.7;
                    transform: scale(1.2) rotate(90deg);
                }
                100% {
                    opacity: 0;
                    transform: scale(0) rotate(180deg);
                }
            }

            /* Special cursor states */
            .retro-cursor-default {
                cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><polygon points="0,0 0,12 4,8 8,12 12,8 4,0" fill="%23FFFFFF" stroke="%23000000" stroke-width="1"/></svg>'), auto;
            }

            .retro-cursor-pointer {
                cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M4 0 L4 10 L7 7 L10 11 L12 10 L9 6 L12 6 L4 0" fill="%23FFFFFF" stroke="%23000000" stroke-width="1"/></svg>'), pointer;
            }

            /* Apply retro cursors to elements */
            body {
                cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><polygon points="0,0 0,12 4,8 8,12 12,8 4,0" fill="%23FFFFFF" stroke="%23000000" stroke-width="1"/></svg>'), auto;
            }

            button, input[type="button"], input[type="submit"], a {
                cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M4 0 L4 10 L7 7 L10 11 L12 10 L9 6 L12 6 L4 0" fill="%23FFD700" stroke="%23000000" stroke-width="1"/></svg>'), pointer !important;
            }

            input[type="text"], textarea {
                cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect x="7" y="2" width="2" height="12" fill="%23000000"/><rect x="4" y="2" width="8" height="2" fill="%23000000"/><rect x="4" y="12" width="8" height="2" fill="%23000000"/></svg>'), text !important;
            }
        `;
        
        document.head.appendChild(style);
    }

    attachEventListeners() {
        // Track mouse position
        document.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
            
            // Create sparkles occasionally
            if (Math.random() < 0.1) {
                this.createSparkle(e.clientX, e.clientY);
            }
        });

        // Special effects for clicks
        document.addEventListener('click', (e) => {
            this.createClickEffect(e.clientX, e.clientY);
        });

        // Enhanced effects for donation button
        document.addEventListener('click', (e) => {
            if (e.target.value && e.target.value.includes('DONATE')) {
                this.createDonationEffect(e.clientX, e.clientY);
            }
        });

        // Special effects for form submissions
        document.addEventListener('htmx:afterRequest', (e) => {
            if (e.detail.successful) {
                this.createSuccessEffect();
            }
        });
    }

    createTrail(x, y) {
        const trail = document.createElement('div');
        trail.className = 'cursor-trail';
        trail.style.left = (x - 4) + 'px';
        trail.style.top = (y - 4) + 'px';
        
        document.body.appendChild(trail);
        this.trails.push({
            element: trail,
            age: 0
        });

        // Remove excess trails
        if (this.trails.length > this.maxTrails) {
            const oldTrail = this.trails.shift();
            if (oldTrail.element.parentNode) {
                oldTrail.element.parentNode.removeChild(oldTrail.element);
            }
        }
    }

    createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'cursor-sparkle';
        
        // Random offset around cursor
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        
        sparkle.style.left = (x + offsetX) + 'px';
        sparkle.style.top = (y + offsetY) + 'px';
        
        document.body.appendChild(sparkle);
        
        // Remove after animation
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 800);
    }

    createStar(x, y) {
        const star = document.createElement('div');
        star.className = 'cursor-star';
        star.innerHTML = ['★', '✦', '✧', '✩'][Math.floor(Math.random() * 4)];
        
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        
        star.style.left = (x + offsetX) + 'px';
        star.style.top = (y + offsetY) + 'px';
        
        document.body.appendChild(star);
        
        setTimeout(() => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
            }
        }, 1000);
    }

    createClickEffect(x, y) {
        // Create multiple sparkles on click
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createSparkle(x, y);
            }, i * 50);
        }
        
        // Add a star
        this.createStar(x, y);
    }

    createDonationEffect(x, y) {
        // Extra fancy effect for donation button
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createSparkle(x, y);
                this.createStar(x, y);
            }, i * 30);
        }
        
        // Create money symbol effects
        const symbols = ['$', '€', '£', '¥', '₿'];
        symbols.forEach((symbol, i) => {
            setTimeout(() => {
                const moneySymbol = document.createElement('div');
                moneySymbol.style.position = 'fixed';
                moneySymbol.style.left = (x + (Math.random() - 0.5) * 100) + 'px';
                moneySymbol.style.top = (y + (Math.random() - 0.5) * 100) + 'px';
                moneySymbol.style.fontSize = '20px';
                moneySymbol.style.color = '#00FF00';
                moneySymbol.style.fontWeight = 'bold';
                moneySymbol.style.pointerEvents = 'none';
                moneySymbol.style.zIndex = '10001';
                moneySymbol.style.animation = 'star-twinkle 1.5s ease-out forwards';
                moneySymbol.textContent = symbol;
                
                document.body.appendChild(moneySymbol);
                
                setTimeout(() => {
                    if (moneySymbol.parentNode) {
                        moneySymbol.parentNode.removeChild(moneySymbol);
                    }
                }, 1500);
            }, i * 100);
        });
    }

    createSuccessEffect() {
        // Celebration effect across screen
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const x = Math.random() * window.innerWidth;
                const y = Math.random() * window.innerHeight;
                this.createSparkle(x, y);
                this.createStar(x, y);
            }, i * 100);
        }
    }

    startAnimation() {
        const animate = () => {
            // Update trail positions
            this.trails.forEach((trail, index) => {
                trail.age++;
                const opacity = Math.max(0, 1 - (trail.age / this.maxTrails));
                const scale = opacity;
                
                trail.element.style.opacity = opacity;
                trail.element.style.transform = `scale(${scale})`;
                
                if (opacity <= 0) {
                    if (trail.element.parentNode) {
                        trail.element.parentNode.removeChild(trail.element);
                    }
                    this.trails.splice(index, 1);
                }
            });

            // Create new trail point
            if (this.enabled) {
                this.createTrail(this.mousePos.x, this.mousePos.y);
            }

            this.animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    toggle() {
        this.enabled = !this.enabled;
        
        if (!this.enabled) {
            // Clean up all trails
            this.trails.forEach(trail => {
                if (trail.element.parentNode) {
                    trail.element.parentNode.removeChild(trail.element);
                }
            });
            this.trails = [];
        }
        
        return this.enabled;
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up all elements
        document.querySelectorAll('.cursor-trail, .cursor-sparkle, .cursor-star').forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        
        this.trails = [];
        this.sparkles = [];
    }
}

// Initialize retro cursor system
window.retroCursor = new RetroCursorSystem();

// Export for manual control
window.toggleRetroCursor = () => window.retroCursor.toggle();