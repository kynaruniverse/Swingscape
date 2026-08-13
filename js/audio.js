// ============================================================
// PANCAKE PLOP! — AUDIO MANAGER
// Web Audio API – simple sound effects
// ============================================================

const AudioManager = {

    context: null,
    enabled: true,
    volume: 0.5,

    // --------------------------------------------------------
    // INIT
    // --------------------------------------------------------

    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            // Resume on first user interaction
            this.enabled = true;
        } catch (e) {
            console.warn('Audio not supported:', e);
            this.enabled = false;
        }

        // Volume from config (if defined)
        if (CONFIG.audio) {
            this.volume = CONFIG.audio.volume || 0.5;
        }
    },

    // --------------------------------------------------------
    // PLAY TONE
    // --------------------------------------------------------

    playTone(frequency, duration, type = 'sine', volume = this.volume) {
        if (!this.enabled || !this.context) return;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = type;
        osc.frequency.value = frequency;
        gain.gain.value = volume * 0.3;
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.context.destination);
        osc.start();
        osc.stop(this.context.currentTime + duration);
    },

    // --------------------------------------------------------
    // SOUND EFFECTS
    // --------------------------------------------------------

    flip() {
        this.playTone(400, 0.12, 'sine', 0.4);
        this.playTone(600, 0.08, 'sine', 0.2);
    },

    land() {
        this.playTone(250, 0.15, 'sine', 0.3);
        this.playTone(300, 0.10, 'sine', 0.2);
    },

    butterBounce() {
        this.playTone(700, 0.18, 'square', 0.3);
        this.playTone(500, 0.12, 'sine', 0.2);
    },

    win() {
        [523, 659, 784, 1047].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.25, 'sine', 0.4), i * 120);
        });
    },

    lose() {
        this.playTone(300, 0.3, 'sawtooth', 0.2);
        this.playTone(200, 0.3, 'sawtooth', 0.2);
    },

    // --------------------------------------------------------
    // RESUME ON USER GESTURE
    // --------------------------------------------------------

    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }
};

window.AudioManager = AudioManager;