// ============================================================
// PANCAKE PLOP! — UI MANAGEMENT
//
// DOM UI is intentionally kept separate from the Pixi game
// world.
//
// Pixi:
// - game world
// - pancake
// - obstacles
// - particles
//
// DOM:
// - menus
// - HUD
// - messages
// - charge meter
// ============================================================

const UI = {

    // --------------------------------------------------------
    // DOM REFERENCES
    // --------------------------------------------------------

    overlay: null,

    messageEl: null,

    flipCounter: null,

    levelIndicator: null,

    startButton: null,

    chargeUI: null,

    chargeFill: null,

    chargePercent: null,

    menuCard: null,

    menuKicker: null,

    menuTitle: null,

    menuDescription: null,

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    messageTimeout: null,

    initialized: false,

    // Tutorial
    tutorialShown: false,

    // Best flips
    bestFlips: 0,

    // Fullscreen
    fullscreenButton: null,

    // --------------------------------------------------------
    // INITIALISE
    // --------------------------------------------------------

    init() {

        this.overlay =
            document.getElementById(
                'ui-overlay'
            );

        this.messageEl =
            document.getElementById(
                'message'
            );

        this.flipCounter =
            document.getElementById(
                'flip-counter'
            );

        this.levelIndicator =
            document.getElementById(
                'level-indicator'
            );

        this.startButton =
            document.getElementById(
                'startButton'
            );

        this.chargeUI =
            document.getElementById(
                'charge-ui'
            );

        this.chargeFill =
            document.getElementById(
                'charge-fill'
            );

        this.chargePercent =
            document.getElementById(
                'charge-percent'
            );

        /*
         * Menu elements.
         *
         * These are discovered rather than requiring additional
         * HTML IDs, keeping the current HTML compatible.
         */

        this.menuCard =
            this.overlay
                ? this.overlay.querySelector(
                    '.menu-card'
                )
                : null;

        this.menuKicker =
            this.menuCard
                ? this.menuCard.querySelector(
                    '.menu-kicker'
                )
                : null;

        this.menuTitle =
            this.menuCard
                ? this.menuCard.querySelector(
                    'h1'
                )
                : null;

        this.menuDescription =
            this.menuCard
                ? this.menuCard.querySelector(
                    '.menu-description'
                )
                : null;

        this.validateElements();

        this.bindStartButton();

        this.hideMessage();

        this.hideCharge();

        this.updateFlipCounter(0);

        this.updateLevel(1);

        this.setStartScreen();

        // Load best flips from localStorage
        this.bestFlips = parseInt(localStorage.getItem('pancakePlopBestFlips')) || 0;
        this.updateBestFlips();

        // Tutorial flag
        this.tutorialShown = localStorage.getItem('pancakePlopTutorialShown') === 'true';

        // Fullscreen button
        this.createFullscreenButton();

        // Bind fullscreen change
        document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());

        // Audio resume on any interaction
        document.addEventListener('pointerdown', () => { if (AudioManager) AudioManager.resume(); });
        document.addEventListener('keydown', () => { if (AudioManager) AudioManager.resume(); });

        this.initialized = true;

        console.log(
            'UI initialized'
        );
    },

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // START BUTTON
    // --------------------------------------------------------

    bindStartButton() {

        if (!this.startButton) {
            return;
        }

        /*
         * onclick intentionally replaces any previous handler.
         *
         * This prevents duplicate listeners when UI.init()
         * is called more than once.
         */

        this.startButton.onclick = () => {

            /*
             * Mobile browsers suspend AudioContext until the
             * first user gesture. This is that gesture — always
             * the earliest possible point, whether starting for
             * the first time or restarting after a level.
             *
             * AudioManager.resume() existed before this fix but
             * was never actually called anywhere (audit finding).
             */

            if (
                typeof AudioManager !== 'undefined' &&
                typeof AudioManager.resume === 'function'
            ) {
                AudioManager.resume();
            }

            if (
                typeof Game === 'undefined' ||
                !Game
            ) {
                console.error(
                    'UI: Game system is not available.'
                );

                return;
            }

            /*
             * UI must never set Game.state directly.
             *
             * Both Start and Restart use Game.start().
             */
            Game.start();
        };
    },

    // --------------------------------------------------------
    // OVERLAY
    // --------------------------------------------------------

    showOverlay(smooth = false) {

        if (!this.overlay) {
            return;
        }

        if (smooth) {
            this.overlay.style.transition = 'opacity 0.6s ease, visibility 0.6s ease';
        }

        this.overlay.classList.remove(
            'hidden'
        );

        if (this.startButton) {

            this.startButton.style.display =
                'flex';
        }
    },

    hideOverlay(smooth = false) {

        if (!this.overlay) {
            return;
        }

        if (smooth) {
            this.overlay.style.transition = 'opacity 0.6s ease, visibility 0.6s ease';
        }

        this.overlay.classList.add(
            'hidden'
        );
    },

    // --------------------------------------------------------
    // START SCREEN
    // --------------------------------------------------------

    setStartScreen() {

        if (this.menuKicker) {

            this.menuKicker.textContent =
                'WELCOME TO THE KITCHEN';
        }

        if (this.menuTitle) {

            this.menuTitle.innerHTML = `
                Pancake<br>
                <span>Plop!</span>
            `;
        }

        if (this.menuDescription) {

            this.menuDescription.textContent =
                'Flip the pancake, dodge the kitchen chaos, and land it perfectly on the plate.';
        }

        if (!this.startButton) {
            return;
        }

        this.startButton.innerHTML = `
            <span
                class="button-icon"
                aria-hidden="true"
            >🥞</span>

            <span>
                Start Level
            </span>

            <span
                class="button-arrow"
                aria-hidden="true"
            >→</span>
        `;

        this.startButton.style.display =
            'flex';
    },

    // --------------------------------------------------------
    // RESTART SCREEN
    // --------------------------------------------------------

    setRestartScreen() {

        if (this.menuKicker) {

            this.menuKicker.textContent =
                'NICE FLIP!';
        }

        if (this.menuTitle) {

            this.menuTitle.innerHTML = `
                Pancake<br>
                <span>Plop!</span>
            `;
        }

        if (this.menuDescription) {

            this.menuDescription.textContent =
                `Level ${Game.level || 1} – Ready for another flip? Try to beat your best run.`;
        }

        if (!this.startButton) {
            return;
        }

        this.startButton.innerHTML = `
            <span
                class="button-icon"
                aria-hidden="true"
            >🎮</span>

            <span>
                Play Again
            </span>

            <span
                class="button-arrow"
                aria-hidden="true"
            >→</span>
        `;

        this.startButton.style.display =
            'flex';
    },

    // --------------------------------------------------------
    // MESSAGE
    // --------------------------------------------------------

    showMessage(
        text,
        duration = 2000
    ) {

        if (!this.messageEl) {
            return;
        }

        clearTimeout(
            this.messageTimeout
        );

        this.messageTimeout = null;

        this.messageEl.textContent =
            text;

        /*
         * Force the animation state to restart cleanly.
         */

        this.messageEl.classList.remove(
            'visible'
        );

        requestAnimationFrame(() => {

            if (!this.messageEl) {
                return;
            }

            this.messageEl.classList.add(
                'visible'
            );
        });

        if (
            Number.isFinite(duration) &&
            duration > 0
        ) {

            this.messageTimeout =
                setTimeout(() => {

                    this.hideMessage();

                }, duration);
        }
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

    // --------------------------------------------------------
    // FLIP COUNTER
    // --------------------------------------------------------

    updateFlipCounter(count) {

        if (!this.flipCounter) {
            return;
        }

        const value =
            this.flipCounter.querySelector(
                '.hud-value'
            );

        const safeCount =
            Math.max(
                0,
                Math.floor(
                    Number(count) || 0
                )
            );

        if (value) {

            value.textContent =
                `Flips: ${safeCount}`;

        } else {

            this.flipCounter.textContent =
                `🥞 Flips: ${safeCount}`;
        }

        // Update best flips
        this.updateBestFlipsIfNeeded(safeCount);
    },

    // --------------------------------------------------------
    // BEST FLIPS
    // --------------------------------------------------------

    updateBestFlips() {
        const flipPill = document.getElementById('flip-counter');
        if (!flipPill) return;
        let bestEl = flipPill.querySelector('.best-flips');
        if (!bestEl) {
            bestEl = document.createElement('span');
            bestEl.className = 'best-flips';
            bestEl.style.cssText = 'font-size: 10px; opacity: 0.6; margin-left: 6px;';
            flipPill.appendChild(bestEl);
        }
        bestEl.textContent = `🏆 ${this.bestFlips}`;
    },

    updateBestFlipsIfNeeded(flips) {
        if (flips > this.bestFlips) {
            this.bestFlips = flips;
            localStorage.setItem('pancakePlopBestFlips', String(this.bestFlips));
            this.updateBestFlips();
        }
    },

    // --------------------------------------------------------
    // LEVEL
    // --------------------------------------------------------

    updateLevel(level) {

        if (!this.levelIndicator) {
            return;
        }

        const value =
            this.levelIndicator.querySelector(
                '.hud-value'
            );

        const safeLevel =
            Math.max(
                1,
                Math.floor(
                    Number(level) || 1
                )
            );

        if (value) {

            value.textContent =
                `Level ${safeLevel}`;

        } else {

            this.levelIndicator.textContent =
                `⭐ Level ${safeLevel}`;
        }
    },

    // --------------------------------------------------------
    // CHARGE METER
    // --------------------------------------------------------

    updateCharge(percent) {

        if (
            !this.chargeUI ||
            !this.chargeFill ||
            !this.chargePercent
        ) {
            return;
        }

        const numericPercent =
            Number(percent);

        const safePercent =
            Number.isFinite(
                numericPercent
            )
                ? Math.max(
                    0,
                    Math.min(
                        1,
                        numericPercent
                    )
                )
                : 0;

        const displayPercent =
            Math.round(
                safePercent * 100
            );

        this.chargeFill.style.width =
            `${displayPercent}%`;

        this.chargePercent.textContent =
            `${displayPercent}%`;

        /*
         * Keep accessibility state synchronised.
         */

        const progressBar =
            this.chargeUI.querySelector(
                '[role="progressbar"]'
            );

        if (progressBar) {

            progressBar.setAttribute(
                'aria-valuenow',
                String(displayPercent)
            );
        }
    },

    // --------------------------------------------------------
    // SHOW CHARGE
    //
    // Phase 10:
    // UI reads charge state from Input/Pancake.
    // It does not calculate charge physics itself.
    // --------------------------------------------------------

    showCharge(percent = 0) {

        if (!this.chargeUI) {
            return;
        }

        this.chargeUI.classList.add(
            'visible'
        );

        this.updateCharge(percent);
    },

    // --------------------------------------------------------
    // HIDE CHARGE
    // --------------------------------------------------------

    hideCharge() {

        if (!this.chargeUI) {
            return;
        }

        this.chargeUI.classList.remove(
            'visible'
        );

        this.updateCharge(0);
    },

    // --------------------------------------------------------
    // UPDATE
    //
    // Called from the main game loop if needed.
    // --------------------------------------------------------

    update() {

        if (
            typeof Input === 'undefined' ||
            !Input
        ) {
            return;
        }

        if (Input.isCharging) {

            this.showCharge(
                Input.getChargePercent()
            );

        } else {

            /*
             * Do not immediately hide the meter here.
             *
             * Input may have just released and Pancake.flip()
             * may still be processing the same frame.
             *
             * The game state controls the final visibility.
             */

            if (
                Game.state !== 'playing'
            ) {
                this.hideCharge();
            }
        }
    },

    // --------------------------------------------------------
    // PLAYING UI
    // --------------------------------------------------------

    setPlayingUI() {

        this.hideOverlay(true);

        this.hideMessage();

        this.hideCharge();

        this.updateCharge(0);
    },

    // --------------------------------------------------------
    // WIN UI
    // --------------------------------------------------------

    setWinUI() {

        this.hideCharge();

        this.showMessage(
            'PERFECT LANDING! 🎉',
            3000
        );

        // Show overlay with smooth transition
        setTimeout(() => {
            this.setRestartScreen();
            this.showOverlay(true);
        }, 1200);
    },

    // --------------------------------------------------------
    // LOSE UI
    // --------------------------------------------------------

    setLoseUI() {

        this.hideCharge();

        this.setRestartScreen();

        this.showMessage(
            'OH NO! THE PANCAKE FELL! 🥞',
            1800
        );

        this.showOverlay(true);
    },

    // --------------------------------------------------------
    // TUTORIAL
    // --------------------------------------------------------

    showTutorial() {
        if (this.tutorialShown) return;
        this.tutorialShown = true;
        localStorage.setItem('pancakePlopTutorialShown', 'true');

        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.style.cssText = `
            position: absolute; inset: 0; z-index: 200;
            display: flex; align-items: center; justify-content: center;
            background: rgba(0,0,0,0.4); backdrop-filter: blur(2px);
            animation: fadeIn 0.3s ease;
            pointer-events: auto;
        `;
        const card = document.createElement('div');
        card.style.cssText = `
            max-width: 280px; padding: 24px; border-radius: 24px;
            background: rgba(255,252,247,0.95); text-align: center;
            box-shadow: 0 16px 40px rgba(0,0,0,0.2);
        `;
        card.innerHTML = `
            <h2 style="font-size: 24px; margin: 0 0 8px;">🥞 Important!</h2>
            <p style="font-size: 14px; line-height: 1.5; margin-bottom: 16px;">
                Land <strong>face‑up</strong> on the plate to win!<br>
                If you land face‑down, it's a fail.
            </p>
            <p style="font-size: 13px; color: #8b6748; margin-bottom: 16px;">
                Hold anywhere to charge, release to flip.
            </p>
            <button id="tutorial-ok" style="
                background: #ffbb72; border: none; border-radius: 18px;
                padding: 12px 32px; font-weight: 900; font-size: 16px;
                color: white; cursor: pointer; box-shadow: 0 4px 0 #c96d27;
            ">Got it!</button>
        `;
        overlay.appendChild(card);
        document.getElementById('ui-container').appendChild(overlay);

        document.getElementById('tutorial-ok').addEventListener('click', () => {
            overlay.remove();
        });
    },

    // --------------------------------------------------------
    // CONTROLS HINT
    // --------------------------------------------------------

    showControlsHint(flipCount) {
        if (flipCount === 1 && !this.tutorialShown) {
            this.showMessage('💡 Hold to charge, release to flip!', 2000);
        }
    },

    // --------------------------------------------------------
    // FULLSCREEN
    // --------------------------------------------------------

    createFullscreenButton() {
        const btn = document.createElement('button');
        btn.id = 'fullscreen-btn';
        btn.textContent = '⛶';
        btn.style.cssText = `
            position: absolute; top: 16px; right: 16px; z-index: 30;
            width: 40px; height: 40px; border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.6);
            background: rgba(255,252,246,0.85);
            backdrop-filter: blur(4px);
            font-size: 20px; color: #5c3a1e;
            cursor: pointer; touch-action: manipulation;
            display: none;
            align-items: center;
            justify-content: center;
        `;
        btn.addEventListener('click', () => this.toggleFullscreen());
        const container = document.getElementById('ui-container');
        if (container) container.appendChild(btn);
        this.fullscreenButton = btn;

        const check = () => {
            btn.style.display = window.innerWidth > 768 ? 'flex' : 'none';
        };
        window.addEventListener('resize', check);
        check();
    },

    toggleFullscreen() {
        const el = document.getElementById('game');
        if (!document.fullscreenElement) {
            el.requestFullscreen?.() || el.webkitRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() || document.webkitExitFullscreen?.();
        }
    },

    updateFullscreenButton() {
        if (this.fullscreenButton) {
            const isFull = !!document.fullscreenElement;
            this.fullscreenButton.textContent = isFull ? '⛶' : '⛶';
        }
    },

    // --------------------------------------------------------
    // RESET
    // --------------------------------------------------------

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

        this.showOverlay();
    }
};


// ============================================================
// PRESENTATION EVENT SUBSCRIPTIONS
// ============================================================
//
// Registered once at load time — see particles.js for why.
// ============================================================

PresentationEvents.on('land', payload => {

    /*
     * The contextual message is surface-dependent, mirroring
     * the exact conditional that used to live inline in the
     * butter/counter/griddle branches of Pancake.land(). Plate
     * landings show no message here — Game.win()/Game.lose()
     * handle their own messaging.
     */

    if (payload.surfaceLabel === 'butter') {
        UI.showMessage('Boing! 🧈');
    } else if (
        payload.surfaceLabel === 'counter' ||
        payload.surfaceLabel === 'griddle'
    ) {
        UI.showMessage('Nice! Flip again! 🥞');
    }
});

window.UI = UI;