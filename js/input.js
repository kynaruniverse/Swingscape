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

    // Keyboard state
    keyboardDown: false,
    keyboardActive: false,

    // Trajectory guide
    trajectoryGraphics: null,
    showTrajectory: false,

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
        lostpointercapture: null,
        keydown: null,
        keyup: null
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

        // ----------------------------------------------------
        // Keyboard listeners
        // ----------------------------------------------------

        this.handlers.keydown = (e) => {
            if (e.key === ' ' || e.key === 'Space') {
                e.preventDefault();
                if (!this.keyboardDown && Game.state === 'playing') {
                    this.keyboardDown = true;
                    this.keyboardActive = true;
                    // Simulate pointer down
                    this.onPointerDown({
                        pointerType: 'keyboard',
                        button: 0,
                        currentTarget: view,
                        preventDefault: () => {}
                    });
                }
            }
        };

        this.handlers.keyup = (e) => {
            if (e.key === ' ' || e.key === 'Space') {
                e.preventDefault();
                if (this.keyboardDown) {
                    this.keyboardDown = false;
                    this.keyboardActive = false;
                    // Simulate pointer up
                    this.onPointerUp({
                        pointerType: 'keyboard',
                        button: 0,
                        currentTarget: view,
                        preventDefault: () => {}
                    });
                }
            }
        };

        document.addEventListener('keydown', this.handlers.keydown);
        document.addEventListener('keyup', this.handlers.keyup);

        // ----------------------------------------------------
        // Trajectory graphics
        // ----------------------------------------------------

        if (!this.trajectoryGraphics) {
            this.trajectoryGraphics = new PIXI.Graphics();
            Renderer.layers.effects.addChild(this.trajectoryGraphics);
            this.trajectoryGraphics.zIndex = 35;
            this.trajectoryGraphics.visible = false;
        }

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

        if (view) {
            if (this.handlers.pointerdown) {
                view.removeEventListener('pointerdown', this.handlers.pointerdown);
            }
            if (this.handlers.pointerup) {
                view.removeEventListener('pointerup', this.handlers.pointerup);
            }
            if (this.handlers.pointercancel) {
                view.removeEventListener('pointercancel', this.handlers.pointercancel);
            }
            if (this.handlers.lostpointercapture) {
                view.removeEventListener('lostpointercapture', this.handlers.lostpointercapture);
            }
        }

        if (this.handlers.keydown) {
            document.removeEventListener('keydown', this.handlers.keydown);
            this.handlers.keydown = null;
        }
        if (this.handlers.keyup) {
            document.removeEventListener('keyup', this.handlers.keyup);
            this.handlers.keyup = null;
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

        // Show trajectory
        this.showTrajectory = true;
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

        // Hide trajectory
        this.showTrajectory = false;
        if (this.trajectoryGraphics) {
            this.trajectoryGraphics.visible = false;
            this.trajectoryGraphics.clear();
        }

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

        // Hide trajectory
        this.showTrajectory = false;
        if (this.trajectoryGraphics) {
            this.trajectoryGraphics.visible = false;
            this.trajectoryGraphics.clear();
        }

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

        // Update trajectory if charging
        if (this.isCharging && this.showTrajectory) {
            this.updateTrajectory();
        }
    },

    // --------------------------------------------------------
    // TRAJECTORY GUIDE
    // --------------------------------------------------------

    updateTrajectory() {

        const pancake = Pancake.body;
        if (!pancake) return;

        const power = this.chargePower / CONFIG.gameplay.flip.maxPower;
        const normalizedPower = Math.max(0, Math.min(1, power));

        // Calculate launch velocity based on current power
        const upward = -(
            CONFIG.gameplay.flip.upwardVelocityMin +
            normalizedPower * (
                CONFIG.gameplay.flip.upwardVelocityMax -
                CONFIG.gameplay.flip.upwardVelocityMin
            )
        );
        const forward = CONFIG.gameplay.flip.forwardVelocityMin +
            normalizedPower * (
                CONFIG.gameplay.flip.forwardVelocityMax -
                CONFIG.gameplay.flip.forwardVelocityMin
            );

        const startX = pancake.position.x;
        const startY = pancake.position.y;
        const g = CONFIG.physics.gravity.y;

        // Simple projectile simulation (no air friction)
        const steps = 30;
        const dt = 0.05;
        const points = [];
        let vx = forward;
        let vy = upward;
        let x = startX;
        let y = startY;

        for (let i = 0; i < steps; i++) {
            x += vx * dt;
            y += vy * dt;
            vy += g * dt;
            if (y > CONFIG.canvasHeight) break;
            points.push({ x, y });
        }

        // Draw dashed line
        const gfx = this.trajectoryGraphics;
        gfx.clear();
        gfx.lineStyle(2, 0xffdd88, 0.6);
        gfx.moveTo(startX, startY);
        for (let i = 0; i < points.length; i++) {
            if (i % 2 === 0) {
                gfx.lineTo(points[i].x, points[i].y);
            } else {
                gfx.moveTo(points[i].x, points[i].y);
            }
        }
        // Draw small circles at each point
        gfx.beginFill(0xffdd88, 0.3);
        points.forEach((p, idx) => {
            if (idx % 2 === 0) {
                gfx.drawCircle(p.x, p.y, 2);
            }
        });
        gfx.endFill();
        this.trajectoryGraphics.visible = true;
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

        this.keyboardDown = false;
        this.keyboardActive = false;

        this.showTrajectory = false;
        if (this.trajectoryGraphics) {
            this.trajectoryGraphics.visible = false;
            this.trajectoryGraphics.clear();
        }

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