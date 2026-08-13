// UI Management - Robust Version
const UI = {
    overlay: null,
    messageEl: null,
    flipCounter: null,
    startButton: null,
    messageTimeout: null,

    init() {
        this.overlay = document.getElementById('ui-overlay');
        this.messageEl = document.getElementById('message');
        this.flipCounter = document.getElementById('flip-counter');
        this.startButton = document.getElementById('startButton');

        // Bind button click event
        this.bindStartButton();

        // Hide message initially
        if (this.messageEl) {
            this.messageEl.style.display = 'none';
        }

        console.log('UI initialized');
    },

    bindStartButton() {
        if (this.startButton) {
            // Remove any existing listeners (not strictly necessary, but safe)
            this.startButton.onclick = null;
            this.startButton.addEventListener('click', () => {
                console.log('Start button clicked');
                Game.start();
            });
        } else {
            console.error('Start button not found');
        }
    },

    showMessage(text) {
        if (this.messageEl) {
            this.messageEl.textContent = text;
            this.messageEl.style.display = 'block';

            clearTimeout(this.messageTimeout);
            this.messageTimeout = setTimeout(() => {
                this.messageEl.style.display = 'none';
            }, 2000);
        }
    },

    updateFlipCounter(count) {
        if (this.flipCounter) {
            this.flipCounter.textContent = `Flips: ${count}`;
        }
    },

    hideOverlay() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
    },

    showOverlay() {
        if (this.overlay) {
            this.overlay.style.display = 'flex';
        }
    },

    showRestartButton() {
        if (this.startButton) {
            this.startButton.textContent = 'Play Again! 🎮';
            this.startButton.style.display = 'block';
            // Re-bind to avoid duplicate listeners
            this.bindStartButton();
        }
    }
};

window.UI = UI;