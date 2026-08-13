// UI Management
//
// DOM UI is intentionally kept separate from the Pixi game world.
// Pixi handles the game scene.
// This module handles menus, HUD, messages and the charge meter.

const UI = {
    overlay: null,
    messageEl: null,
    flipCounter: null,
    levelIndicator: null,
    startButton: null,

    chargeUI: null,
    chargeFill: null,
    chargePercent: null,

    messageTimeout: null,

    init() {
        this.overlay =
            document.getElementById('ui-overlay');

        this.messageEl =
            document.getElementById('message');

        this.flipCounter =
            document.getElementById('flip-counter');

        this.levelIndicator =
            document.getElementById('level-indicator');

        this.startButton =
            document.getElementById('startButton');

        this.chargeUI =
            document.getElementById('charge-ui');

        this.chargeFill =
            document.getElementById('charge-fill');

        this.chargePercent =
            document.getElementById('charge-percent');

        this.validateElements();
        this.bindStartButton();

        this.hideMessage();
        this.hideCharge();

        this.updateFlipCounter(0);
        this.updateLevel(1);

        console.log('UI initialized');
    },

    validateElements() {
        const required = [
            ['ui-overlay', this.overlay],
            ['message', this.messageEl],
            ['flip-counter', this.flipCounter],
            ['level-indicator', this.levelIndicator],
            ['startButton', this.startButton],
            ['charge-ui', this.chargeUI],
            ['charge-fill', this.chargeFill],
            ['charge-percent', this.chargePercent]
        ];

        required.forEach(
            ([id, element]) => {
                if (!element) {
                    console.error(
                        `UI element #${id} was not found.`
                    );
                }
            }
        );
    },

    bindStartButton() {
        if (!this.startButton) {
            return;
        }

        /*
         * onclick is intentionally used here so repeated calls to
         * bindStartButton never create duplicate listeners.
         */
        this.startButton.onclick = () => {
            console.log('Start button clicked');
            Game.start();
        };
    },

    showOverlay() {
        if (!this.overlay) {
            return;
        }

        this.overlay.classList.remove(
            'hidden'
        );

        this.startButton.style.display =
            'flex';
    },

    hideOverlay() {
        if (!this.overlay) {
            return;
        }

        this.overlay.classList.add(
            'hidden'
        );
    },

    setStartScreen() {
        if (!this.startButton) {
            return;
        }

        this.startButton.innerHTML = `
            <span class="button-icon">🥞</span>
            <span>Start Level</span>
            <span class="button-arrow">→</span>
        `;

        this.startButton.style.display =
            'flex';
    },

    setRestartScreen() {
        if (!this.startButton) {
            return;
        }

        this.startButton.innerHTML = `
            <span class="button-icon">🎮</span>
            <span>Play Again</span>
            <span class="button-arrow">→</span>
        `;

        this.startButton.style.display =
            'flex';
    },

    showMessage(text, duration = 2000) {
        if (!this.messageEl) {
            return;
        }

        clearTimeout(
            this.messageTimeout
        );

        this.messageEl.textContent =
            text;

        /*
         * Force the animation state to restart cleanly.
         */
        this.messageEl.classList.remove(
            'visible'
        );

        requestAnimationFrame(() => {
            this.messageEl.classList.add(
                'visible'
            );
        });

        this.messageTimeout =
            setTimeout(() => {
                this.hideMessage();
            }, duration);
    },

    hideMessage() {
        clearTimeout(
            this.messageTimeout
        );

        this.messageTimeout = null;

        if (this.messageEl) {
            this.messageEl.classList.remove(
                'visible'
            );
        }
    },

    updateFlipCounter(count) {
        if (!this.flipCounter) {
            return;
        }

        const value =
            this.flipCounter.querySelector(
                '.hud-value'
            );

        if (value) {
            value.textContent =
                `Flips: ${count}`;
        } else {
            this.flipCounter.textContent =
                `🥞 Flips: ${count}`;
        }
    },

    updateLevel(level) {
        if (!this.levelIndicator) {
            return;
        }

        const value =
            this.levelIndicator.querySelector(
                '.hud-value'
            );

        if (value) {
            value.textContent =
                `Level ${level}`;
        } else {
            this.levelIndicator.textContent =
                `⭐ Level ${level}`;
        }
    },

    showCharge(percent) {
        if (!this.chargeUI) {
            return;
        }

        const safePercent =
            Math.max(
                0,
                Math.min(
                    1,
                    percent || 0
                )
            );

        const displayPercent =
            Math.round(
                safePercent * 100
            );

        this.chargeFill.style.width =
            `${displayPercent}%`;

        this.chargePercent.textContent =
            `${displayPercent}%`;

        this.chargeUI.classList.add(
            'visible'
        );
    },

    updateCharge(percent) {
        if (!this.chargeUI) {
            return;
        }

        const safePercent =
            Math.max(
                0,
                Math.min(
                    1,
                    percent || 0
                )
            );

        const displayPercent =
            Math.round(
                safePercent * 100
            );

        this.chargeFill.style.width =
            `${displayPercent}%`;

        this.chargePercent.textContent =
            `${displayPercent}%`;
    },

    hideCharge() {
        if (!this.chargeUI) {
            return;
        }

        this.chargeUI.classList.remove(
            'visible'
        );

        if (this.chargeFill) {
            this.chargeFill.style.width =
                '0%';
        }

        if (this.chargePercent) {
            this.chargePercent.textContent =
                '0%';
        }
    },

    setPlayingUI() {
        this.hideOverlay();
        this.hideMessage();
        this.hideCharge();
    },

    setWinUI() {
        this.hideCharge();

        this.showMessage(
            'PERFECT LANDING! 🎉',
            999999
        );

        this.setRestartScreen();
        this.showOverlay();
    },

    setLoseUI() {
        this.hideCharge();

        this.showMessage(
            'OH NO! THE PANCAKE FELL! 🥞',
            1800
        );
    },

    reset() {
        clearTimeout(
            this.messageTimeout
        );

        this.messageTimeout = null;

        this.hideMessage();
        this.hideCharge();

        this.updateFlipCounter(0);
        this.updateLevel(1);

        this.setStartScreen();
    }
};

window.UI = UI;