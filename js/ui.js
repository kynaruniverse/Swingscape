const UI = {
    elements: {},
    messageTimeout: null,

    init() {
        this.elements = {
            flipCounter: document.querySelector('#flip-counter .hud-value'),
            levelIndicator: document.querySelector('#level-indicator .hud-value'),
            message: document.getElementById('message'),
            chargeUI: document.getElementById('charge-ui'),
            chargePercent: document.getElementById('charge-percent'),
            chargeFill: document.getElementById('charge-fill'),
            overlay: document.getElementById('ui-overlay'),
            startButton: document.getElementById('startButton')
        };
        
        if (this.elements.startButton) {
            this.elements.startButton.addEventListener('click', () => {
                Game.startLevel();
            });
        }
    },
    
    showMessage(text) {
        if (!this.elements.message) return;
        this.elements.message.textContent = text;
        this.elements.message.classList.add('visible');
        clearTimeout(this.messageTimeout);
        this.messageTimeout = setTimeout(() => {
            this.elements.message.classList.remove('visible');
        }, 2000);
    },
    
    showControlsHint(flips) {
        if (this.elements.flipCounter) {
            this.elements.flipCounter.textContent = `Flips: ${flips}`;
        }
    },
    
    updateLevel(level) {
        if (this.elements.levelIndicator) {
            this.elements.levelIndicator.textContent = `Level ${level}`;
        }
    },
    
    updateCharge(ratio) {
        if (!this.elements.chargeUI) return;
        this.elements.chargeUI.classList.add('visible');
        const pct = Math.floor(ratio * 100);
        this.elements.chargePercent.textContent = `${pct}%`;
        this.elements.chargeFill.style.width = `${pct}%`;
    },
    
    hideCharge() {
        if (this.elements.chargeUI) {
            this.elements.chargeUI.classList.remove('visible');
        }
    },
    
    showOverlay(title, desc, btnText) {
        if (!this.elements.overlay) return;
        this.elements.overlay.classList.remove('hidden');
        const h1 = this.elements.overlay.querySelector('h1');
        const p = this.elements.overlay.querySelector('.menu-description');
        const btn = this.elements.overlay.querySelector('#startButton span:nth-child(2)');
        if (h1) h1.innerHTML = title;
        if (p) p.innerHTML = desc;
        if (btn) btn.innerHTML = btnText;
    },
    
    hideOverlay() {
        if (this.elements.overlay) {
            this.elements.overlay.classList.add('hidden');
        }
    }
};
window.UI = UI;
