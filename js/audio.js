const AudioManager = {
    ctx: null,
    
    init() {
        if (CONFIG.audio.enabled) {
            try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioContext();
            } catch (e) {
                console.warn('Web Audio API not supported');
            }
        }
    },
    
    playTone(freq, type, duration, vol) {
        if (!this.ctx || !CONFIG.audio.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol * CONFIG.audio.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },
    
    flip() { this.playTone(400, 'sine', 0.2, 0.5); },
    butterBounce() { this.playTone(300, 'triangle', 0.3, 0.6); },
    land() { this.playTone(150, 'square', 0.1, 0.4); },
    win() { this.playTone(600, 'sine', 0.5, 0.6); },
    lose() { this.playTone(100, 'sawtooth', 0.5, 0.5); }
};
window.AudioManager = AudioManager;
