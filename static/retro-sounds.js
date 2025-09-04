// Retro Sound Effects System
// Authentic 90s web experience with Web Audio API

class RetroSoundSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.15;
        this.init();
    }

    async init() {
        try {
            // Initialize Web Audio API (user gesture required)
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create sound library
            await this.createSounds();
            
            // Attach event listeners
            this.attachEventListeners();
            
        } catch (error) {
            this.enabled = false;
        }
    }

    // Generate authentic 90s beeps and clicks
    createBeep(frequency = 800, duration = 0.1, type = 'sine') {
        if (!this.audioContext || !this.enabled) return null;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        return { oscillator, gainNode };
    }

    // Create comprehensive sound library
    async createSounds() {
        // Button click sound
        this.sounds.click = () => {
            const sound = this.createBeep(1200, 0.05, 'square');
            if (sound) {
                sound.oscillator.start();
                sound.oscillator.stop(this.audioContext.currentTime + 0.05);
            }
        };

        // Button hover sound  
        this.sounds.hover = () => {
            const sound = this.createBeep(600, 0.03, 'sine');
            if (sound) {
                sound.oscillator.start();
                sound.oscillator.stop(this.audioContext.currentTime + 0.03);
            }
        };

        // Form submit success
        this.sounds.success = () => {
            [800, 1000, 1200].forEach((freq, i) => {
                setTimeout(() => {
                    const sound = this.createBeep(freq, 0.1, 'sine');
                    if (sound) {
                        sound.oscillator.start();
                        sound.oscillator.stop(this.audioContext.currentTime + 0.1);
                    }
                }, i * 100);
            });
        };

        // Error sound
        this.sounds.error = () => {
            const sound = this.createBeep(300, 0.3, 'sawtooth');
            if (sound) {
                sound.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
                sound.gainNode.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                sound.oscillator.start();
                sound.oscillator.stop(this.audioContext.currentTime + 0.3);
            }
        };

        // Page load sound (dial-up inspired)
        this.sounds.pageLoad = () => {
            // Simulate connection handshake
            [400, 800, 1200, 600, 1000].forEach((freq, i) => {
                setTimeout(() => {
                    const sound = this.createBeep(freq, 0.05, 'square');
                    if (sound) {
                        sound.oscillator.start();
                        sound.oscillator.stop(this.audioContext.currentTime + 0.05);
                    }
                }, i * 80);
            });
        };

        // Donation button special sound
        this.sounds.donation = () => {
            // Cash register "cha-ching"
            const frequencies = [523, 659, 784, 1047]; // C, E, G, C octave
            frequencies.forEach((freq, i) => {
                setTimeout(() => {
                    const sound = this.createBeep(freq, 0.2, 'sine');
                    if (sound) {
                        sound.oscillator.start();
                        sound.oscillator.stop(this.audioContext.currentTime + 0.2);
                    }
                }, i * 50);
            });
        };

        // Video carousel navigation
        this.sounds.navigate = () => {
            const sound = this.createBeep(440, 0.08, 'triangle');
            if (sound) {
                sound.oscillator.start();
                sound.oscillator.stop(this.audioContext.currentTime + 0.08);
            }
        };
    }

    // Attach event listeners for interactive sounds
    attachEventListeners() {
        // Initialize on first user interaction
        const initOnInteraction = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            document.removeEventListener('click', initOnInteraction);
            document.removeEventListener('touchstart', initOnInteraction);
        };

        document.addEventListener('click', initOnInteraction);
        document.addEventListener('touchstart', initOnInteraction);

        // Page load sound
        window.addEventListener('load', () => {
            setTimeout(() => this.play('pageLoad'), 500);
        });

        // Generic button sounds
        document.addEventListener('mouseenter', (e) => {
            if (e.target.tagName === 'INPUT' && (e.target.type === 'button' || e.target.type === 'submit')) {
                this.play('hover');
            }
        }, true);

        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT' && (e.target.type === 'button' || e.target.type === 'submit')) {
                // Special sound for donation button
                if (e.target.value && e.target.value.includes('DONATE')) {
                    this.play('donation');
                } else {
                    this.play('click');
                }
            } else if (e.target.tagName === 'BUTTON') {
                this.play('click');
            }
        });

        // Form submission sounds
        document.addEventListener('htmx:afterRequest', (e) => {
            if (e.detail.successful) {
                this.play('success');
            } else {
                this.play('error');
            }
        });

        // Video carousel navigation
        document.addEventListener('click', (e) => {
            if (e.target.id === 'prev-btn' || e.target.id === 'next-btn') {
                this.play('navigate');
            }
        });
    }

    // Play a sound by name
    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        try {
            this.sounds[soundName]();
        } catch (error) {
        }
    }

    // Toggle sound system
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Adjust volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}

// Initialize retro sound system
window.retroSounds = new RetroSoundSystem();

// Export for manual control
window.playRetroSound = (soundName) => window.retroSounds.play(soundName);
window.toggleRetroSounds = () => window.retroSounds.toggle();
window.setRetroVolume = (volume) => window.retroSounds.setVolume(volume);