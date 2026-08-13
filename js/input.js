// ============================================================
// PANCAKE PLOP! — INPUT SYSTEM
// Pointer-based charging and flip control
// ============================================================

const Input = {

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    isCharging: false,

    chargePower: 0,

    lastChargeTime: 0,

    activePointerId: null,

    initialized: false,

    // --------------------------------------------------------
    // BOUND EVENT HANDLERS
    //
    // Stored so init() can safely remove old listeners before
    // attaching new ones.
    // --------------------------------------------------------

    handlers: {
        pointerdown: null,
        pointerup: null,
        pointercancel: null,
        lostpointercapture: null
    },

    // --------------------------------------------------------
    // INITIALISE
    // --------------------------------------------------------

    init() {

        /*
         * Clean up any previous listeners first.
         *
         * This makes Input.init() safe to call more than once.
         */

        this.removeListeners();

        this.cleanup();

        const view =
            Renderer.app
                ? Renderer.app.view
                : null;

        if (!view) {

            console.warn(
                'Input: Renderer canvas not available.'
            );

            return;
        }

        /*
         * Use Pointer Events rather than separate mouse and
         * touch systems.
         *
         * This gives us one consistent input path across
         * mobile, desktop and stylus devices.
         */

        this.handlers.pointerdown =
            event => this.onPointerDown(event);

        this.handlers.pointerup =
            event => this.onPointerUp(event);

        this.handlers.pointercancel =
            event => this.onPointerCancel(event);

        this.handlers.lostpointercapture =
            event => this.onLostPointerCapture(event);

        view.addEventListener(
            'pointerdown',
            this.handlers.pointerdown
        );

        view.addEventListener(
            'pointerup',
            this.handlers.pointerup
        );

        view.addEventListener(
            'pointercancel',
            this.handlers.pointercancel
        );

        view.addEventListener(
            'lostpointercapture',
            this.handlers.lostpointercapture
        );

        /*
         * Tell the browser that this canvas owns pointer
         * interaction.
         *
         * CSS also sets touch-action:none, but keeping this here
         * makes the canvas behaviour explicit.
         */

        view.style.touchAction = 'none';

        this.initialized = true;

        console.log(
            'Input initialized on Pixi canvas'
        );
    },

    // --------------------------------------------------------
    // REMOVE LISTENERS
    // --------------------------------------------------------

    removeListeners() {

        const view =
            Renderer.app
                ? Renderer.app.view
                : null;

        if (!view) {
            return;
        }

        if (this.handlers.pointerdown) {

            view.removeEventListener(
                'pointerdown',
                this.handlers.pointerdown
            );
        }

        if (this.handlers.pointerup) {

            view.removeEventListener(
                'pointerup',
                this.handlers.pointerup
            );
        }

        if (this.handlers.pointercancel) {

            view.removeEventListener(
                'pointercancel',
                this.handlers.pointercancel
            );
        }

        if (this.handlers.lostpointercapture) {

            view.removeEventListener(
                'lostpointercapture',
                this.handlers.lostpointercapture
            );
        }

        this.handlers.pointerdown = null;
        this.handlers.pointerup = null;
        this.handlers.pointercancel = null;
        this.handlers.lostpointercapture = null;
    },

    // --------------------------------------------------------
    // POINTER DOWN
    // --------------------------------------------------------

    onPointerDown(event) {

        /*
         * Ignore secondary mouse buttons.
         */

        if (
            event.pointerType === 'mouse' &&
            event.button !== 0
        ) {
            return;
        }

        /*
         * Only allow charging while actively playing.
         */

        if (Game.state !== 'playing') {
            return;
        }

        /*
         * Ask Pancake whether a flip is currently possible.
         */

        if (!Pancake.canFlip()) {
            return;
        }

        /*
         * Prevent browser gestures such as scrolling or
         * accidental text interaction.
         */

        event.preventDefault();

        /*
         * Do not allow another pointer to take control while
         * an existing charge is active.
         */

        if (this.isCharging) {
            return;
        }

        this.isCharging = true;

        this.chargePower = 0;

        this.lastChargeTime =
            performance.now();

        this.activePointerId =
            event.pointerId;

        /*
         * Capture the pointer.
         *
         * This is particularly important on mobile:
         * if the player presses, moves their finger and releases
         * slightly outside the canvas, we still receive the
         * pointerup event.
         */

        const view = event.currentTarget;

        if (
            view &&
            typeof view.setPointerCapture === 'function'
        ) {

            try {

                view.setPointerCapture(
                    event.pointerId
                );

            } catch (error) {

                /*
                 * Pointer capture is an enhancement, not a
                 * requirement. Ignore browsers that reject it.
                 */

            }
        }
    },

    // --------------------------------------------------------
    // POINTER UP
    // --------------------------------------------------------

    onPointerUp(event) {

        if (!this.isCharging) {
            return;
        }

        /*
         * Ignore pointerup events belonging to another pointer.
         */

        if (
            this.activePointerId !== null &&
            event.pointerId !== this.activePointerId
        ) {
            return;
        }

        event.preventDefault();

        this.finishCharge(event.currentTarget);
    },

    // --------------------------------------------------------
    // POINTER CANCEL
    // --------------------------------------------------------

    onPointerCancel(event) {

        if (!this.isCharging) {
            return;
        }

        if (
            this.activePointerId !== null &&
            event.pointerId !== this.activePointerId
        ) {
            return;
        }

        this.cancelCharge(event.currentTarget);
    },

    // --------------------------------------------------------
    // LOST POINTER CAPTURE
    // --------------------------------------------------------

    onLostPointerCapture(event) {

        /*
         * If pointer capture disappears unexpectedly while
         * charging, cancel the charge rather than leaving the
         * input system stuck in a charging state.
         */

        if (!this.isCharging) {
            return;
        }

        if (
            this.activePointerId !== null &&
            event.pointerId !== this.activePointerId
        ) {
            return;
        }

        this.cancelCharge(event.currentTarget);
    },

    // --------------------------------------------------------
    // FINISH CHARGE
    // --------------------------------------------------------

    finishCharge(view) {

        if (!this.isCharging) {
            return;
        }

        /*
         * Stop charging first so duplicate pointer events cannot
         * trigger multiple flips.
         */

        this.isCharging = false;

        /*
         * Release pointer capture if possible.
         */

        if (
            view &&
            this.activePointerId !== null &&
            typeof view.releasePointerCapture === 'function'
        ) {

            try {

                if (
                    typeof view.hasPointerCapture !== 'function' ||
                    view.hasPointerCapture(
                        this.activePointerId
                    )
                ) {

                    view.releasePointerCapture(
                        this.activePointerId
                    );
                }

            } catch (error) {

                /*
                 * Ignore pointer-capture cleanup errors.
                 */

            }
        }

        /*
         * Calculate the final charge one last time before
         * releasing it.
         */

        this.updateCharge();

        const power =
            Math.max(
                0,
                Math.min(
                    CONFIG.gameplay.flip.maxPower,
                    this.chargePower
                )
            );

        /*
         * Reset input state before calling Pancake.flip().
         *
         * This prevents re-entrant pointer events from causing
         * another flip during the same interaction.
         */

        this.chargePower = 0;

        this.lastChargeTime = 0;

        this.activePointerId = null;

        const flipped =
            Pancake.flip(power);

        if (flipped) {

            UI.showMessage(
                'Stick the landing! 🛬'
            );
        }
    },

    // --------------------------------------------------------
    // CANCEL CHARGE
    // --------------------------------------------------------

    cancelCharge(view) {

        if (!this.isCharging) {
            return;
        }

        this.isCharging = false;

        if (
            view &&
            this.activePointerId !== null &&
            typeof view.releasePointerCapture === 'function'
        ) {

            try {

                if (
                    typeof view.hasPointerCapture !== 'function' ||
                    view.hasPointerCapture(
                        this.activePointerId
                    )
                ) {

                    view.releasePointerCapture(
                        this.activePointerId
                    );
                }

            } catch (error) {

                /*
                 * Ignore pointer-capture cleanup errors.
                 */

            }
        }

        this.chargePower = 0;

        this.lastChargeTime = 0;

        this.activePointerId = null;
    },

    // --------------------------------------------------------
    // UPDATE CHARGE
    // --------------------------------------------------------

    updateCharge() {

        if (!this.isCharging) {
            return;
        }

        const now =
            performance.now();

        if (!this.lastChargeTime) {

            this.lastChargeTime = now;

            return;
        }

        const deltaTime =
            Math.max(
                0,
                (now - this.lastChargeTime) / 1000
            );

        this.lastChargeTime = now;

        /*
         * Power gained per second.
         *
         * CONFIG.gameplay.flip.chargeRate is expressed as power
         * gained per 60 Hz physics frame.
         *
         * Example:
         *
         * 0.15 × 60 = 9 power / second
         */

        const chargeRate =
            CONFIG.gameplay.flip.chargeRate *
            CONFIG.physics.hz;

        this.chargePower =
            Math.min(
                CONFIG.gameplay.flip.maxPower,
                this.chargePower +
                    deltaTime * chargeRate
            );
    },

    // --------------------------------------------------------
    // UPDATE
    // --------------------------------------------------------

    update() {

        if (!this.isCharging) {
            return;
        }

        /*
         * Stop charging if the game is no longer active.
         */

        if (Game.state !== 'playing') {

            this.cancelCharge();

            return;
        }

        /*
         * Keep the charge calculation tied to the game loop
         * rather than a separate timer.
         */

        this.updateCharge();
    },

    // --------------------------------------------------------
    // CHARGE PERCENTAGE
    // --------------------------------------------------------

    getChargePercent() {

        if (
            CONFIG.gameplay.flip.maxPower <= 0
        ) {
            return 0;
        }

        return Math.max(
            0,
            Math.min(
                1,
                this.chargePower /
                    CONFIG.gameplay.flip.maxPower
            )
        );
    },

    // --------------------------------------------------------
    // CLEANUP
    // --------------------------------------------------------

    cleanup() {

        this.isCharging = false;

        this.chargePower = 0;

        this.lastChargeTime = 0;

        this.activePointerId = null;

        /*
         * Phase 7.5:
         *
         * cleanup() must remove listeners and reset state.
         *
         * This ensures Game.reset() and Input.destroy() both
         * leave the input system fully clean.
         */
        this.removeListeners();
    },

    // --------------------------------------------------------
    // DESTROY
    // --------------------------------------------------------

    destroy() {

        this.cleanup();

        this.initialized = false;
    }
};

window.Input = Input;