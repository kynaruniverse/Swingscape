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

    showOverlay() {

        if (!this.overlay) {
            return;
        }

        this.overlay.classList.remove(
            'hidden'
        );

        if (this.startButton) {

            this.startButton.style.display =
                'flex';
        }
    },

    hideOverlay() {

        if (!this.overlay) {
            return;
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
                'Ready for another flip? Try to beat your best run.';
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

        this.hideOverlay();

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
            2500
        );

        this.setRestartScreen();

        this.showOverlay();
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

        this.showOverlay();
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

window.UI = UI;