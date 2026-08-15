// ============================================================
// PANCAKE PLOP! — MAIN GAME CONTROLLER
//
// Architecture:
//
// Input
//   ↓
// Game State
//   ↓
// Fixed Physics Step
//   ↓
// Matter.js
//   ↓
// Gameplay State
//   ↓
// Pixi Rendering
//   ↓
// HTML UI
//
// The simulation runs at a deterministic 60 Hz.
// Rendering remains independent of the physics timestep.
// ============================================================

const Game = {

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    state: 'menu',

    initialized: false,

    // --------------------------------------------------------
    // FIXED TIMESTEP
    // --------------------------------------------------------

    FIXED_STEP: CONFIG.physics.fixedDeltaMilliseconds,

    accumulator: 0,

    lastFrameTime: 0,

    maxFrameDelta: CONFIG.physics.maxFrameDelta * 1000,

    maxPhysicsStepsPerFrame: CONFIG.physics.maxPhysicsStepsPerFrame,

    // --------------------------------------------------------
    // TIMERS
    // --------------------------------------------------------

    resultTimer: null,

    // --------------------------------------------------------
    // LEVEL & PROGRESSION
    // --------------------------------------------------------

    level: 1,
    flipsInLevel: 0,

    // --------------------------------------------------------
    // INITIALISE
    // --------------------------------------------------------

    init() {

        if (this.initialized) {

            console.warn(
                'Game.init() called more than once.'
            );

            return;
        }

        console.log(
            'Initializing Pancake Plop...'
        );

        /*
         * CONFIG is the single source of truth
         * for the logical game dimensions.
         *
         * Do not mutate it here.
         */

        // ----------------------------------------------------
        // RENDERING
        // ----------------------------------------------------

        Renderer.init();

        // ----------------------------------------------------
        // CAMERA
        // ----------------------------------------------------

        Camera.init();

        // ----------------------------------------------------
        // PHYSICS
        // ----------------------------------------------------

        Physics.init();

        // ----------------------------------------------------
        // PARTICLES
        // ----------------------------------------------------

        Particles.init();

        // ----------------------------------------------------
        // STATIC GAME OBJECTS
        // ----------------------------------------------------

        Obstacles.init();

        /*
         * Presentation reads each obstacle body's starting
         * position/angle immediately, so it must be initialised
         * after Obstacles.
         */

        ObstaclesPresentation.init();

        /*
         * Environment depends on the obstacle bodies,
         * particularly the plate and counter positions.
         */

        Environment.init();

        // ----------------------------------------------------
        // PLAYER
        // ----------------------------------------------------

        Pancake.init();

        /*
         * Presentation reads Pancake.body's starting position
         * immediately, so it must be initialised after Pancake.
         */

        PancakePresentation.init();

        // ----------------------------------------------------
        // INPUT
        // ----------------------------------------------------

        Input.init();

        // ----------------------------------------------------
        // DOM UI
        // ----------------------------------------------------

        UI.init();

        // ----------------------------------------------------
        // AUDIO
        // ----------------------------------------------------

        AudioManager.init();

        // ----------------------------------------------------
        // INITIAL STATE
        // ----------------------------------------------------

        this.state = 'menu';

        this.accumulator = 0;

        this.lastFrameTime = 0;

        this.level = 1;

        this.flipsInLevel = 0;

        this.initialized = true;

        UI.setStartScreen();

        UI.showOverlay();

        console.log(
            'All systems initialized.'
        );

        /*
         * Start the variable-rate render loop.
         *
         * Physics itself is stepped using the fixed timestep
         * inside gameLoop().
         */

        requestAnimationFrame(
            (time) => this.gameLoop(time)
        );
    },

    // --------------------------------------------------------
    // START GAME
    // --------------------------------------------------------

    start() {

        console.log(
            'Starting level...'
        );

        this.clearResultTimer();

        this.reset();

        // Show tutorial if not shown
        if (!UI.tutorialShown) {
            UI.showTutorial();
        }

        this.state = 'playing';

        this.lastFrameTime =
            performance.now();

        this.accumulator = 0;

        this.flipsInLevel = 0;

        UI.setPlayingUI();

        UI.showMessage(
            'Hold to charge, release to flip! 🥞',
            2400
        );
    },

    // --------------------------------------------------------
    // RESET
    // --------------------------------------------------------

    reset() {

        console.log(
            'Resetting game...'
        );

        this.clearResultTimer();

        /*
         * Stop any active input state before rebuilding
         * the simulation.
         */

        Input.cleanup();

        /*
         * Reset the fixed timestep state.
         */

        this.accumulator = 0;

        this.lastFrameTime = 0;

        /*
         * Camera has no per-level state today (identity
         * transform), but resetting it here keeps behaviour
         * correct once tracking/zoom exist.
         */

        Camera.reset();

        /*
         * Clear the current Matter world.
         *
         * The Physics engine itself remains available.
         */

        Physics.clearWorld();

        /*
         * Clear particles from the existing particle
         * container rather than creating a new Pixi
         * container every reset.
         */

        Particles.clear();

        /*
         * Rebuild static physics objects.
         */

        Obstacles.init();

        /*
         * Apply level difficulty scaling
         */
        this.applyLevelDifficulty();

        /*
         * Presentation reads each obstacle body's current
         * position/angle immediately, so it must be initialised
         * after Obstacles AND after level difficulty has
         * repositioned bodies (e.g. the plate).
         */

        ObstaclesPresentation.init();

        /*
         * Rebuild environment visuals so they correspond
         * to the newly created obstacle bodies.
         */

        Environment.init();

        /*
         * Rebuild the player.
         */

        Pancake.init();

        /*
         * Presentation reads Pancake.body's starting position
         * immediately, so it must be initialised after Pancake.
         */

        PancakePresentation.init();

        /*
         * Reinitialise input state.
         */

        Input.init();

        /*
         * The reset creates a fresh playable level,
         * but the caller determines the final game state.
         */

        UI.updateFlipCounter(
            Pancake.flipCount
        );

        UI.updateLevel(this.level);

        UI.hideCharge();

        console.log(
            'Game reset complete.'
        );
    },

    // --------------------------------------------------------
    // LEVEL DIFFICULTY
    // --------------------------------------------------------

    applyLevelDifficulty() {
        const plateBody = Obstacles.items.find(item => item.label === 'plate');
        if (plateBody) {
            const baseX = CONFIG.canvasWidth - 75;
            const offset = Math.sin(this.level * 0.5) * 20;
            Matter.Body.setPosition(plateBody, { x: baseX + offset, y: plateBody.position.y });
        }
        // Additional difficulty: slightly more gravity? Not needed.
    },

    // --------------------------------------------------------
    // FIXED PHYSICS UPDATE
    // --------------------------------------------------------

    fixedUpdate() {

        if (this.state !== 'playing') {
            return;
        }

        /*
         * Advance Matter by exactly one fixed timestep.
         */

        Physics.update();

        /*
         * Update gameplay simulation that belongs to the
         * fixed timestep.
         */

        Pancake.fixedUpdate();

        Particles.update();

        /*
         * Check whether the player has left the playable
         * game space.
         *
         * This is evaluated after the physics step.
         */

        Pancake.checkFell();

        /*
         * If falling caused the game to end, don't continue
         * processing the remainder of this simulation step.
         */

        if (this.state !== 'playing') {
            return;
        }
    },

    // --------------------------------------------------------
    // RENDER / PRESENTATION UPDATE
    // --------------------------------------------------------

    renderUpdate() {

        /*
         * Update real-time input charge.
         */
        Input.update();

        /*
         * Pixi presentation.
         */

        PancakePresentation.renderUpdate();

        ObstaclesPresentation.updateGraphics();

        Environment.update();

        /*
         * Camera transform — must run after all world-space
         * positions are updated for this frame, and before
         * Pixi's own ticker renders it (Renderer.update() below
         * is a no-op hook; Pixi renders automatically).
         */

        Camera.apply();

        /*
         * DOM HUD.
         */

        UI.updateFlipCounter(
            Pancake.flipCount
        );

        /*
         * Charge meter.
         */

        if (
            this.state === 'playing' &&
            Input.isCharging
        ) {

            UI.showCharge(
                Input.getChargePercent()
            );

        } else {

            UI.hideCharge();
        }
    },

    // --------------------------------------------------------
    // WIN
    // --------------------------------------------------------

    win() {

        if (
            this.state === 'won'
        ) {
            return;
        }

        console.log(
            'Game won!'
        );

        this.state = 'won';

        this.accumulator = 0;

        UI.hideCharge();

        Input.cleanup();

        // Increment level
        this.level++;
        this.flipsInLevel = Pancake.flipCount;

        // Update best flips
        UI.updateBestFlipsIfNeeded(Pancake.flipCount);

        // Play win sound
        if (AudioManager) AudioManager.win();

        const plate =
            Obstacles.items.find(
                item =>
                    item.label === 'plate'
            );

        if (plate) {

            Particles.createWin(
                plate.position.x,
                plate.position.y
            );
        }

        UI.showMessage(
            'PERFECT LANDING! 🎉🥞',
            3000
        );

        /*
         * Give the celebration particles time to play
         * before showing the replay button.
         */

        this.clearResultTimer();

        this.resultTimer =
            setTimeout(() => {

                this.resultTimer = null;

                if (
                    this.state !== 'won'
                ) {
                    return;
                }

                UI.setRestartScreen();
                // Update description to show level
                const desc = document.querySelector('.menu-description');
                if (desc) {
                    desc.textContent = `Level ${this.level} – Keep flipping!`;
                }
                UI.showOverlay(true);
                UI.updateLevel(this.level);

            }, 1400);
    },

    // --------------------------------------------------------
    // LOSE
    // --------------------------------------------------------

    lose() {

        if (
            this.state === 'lost'
        ) {
            return;
        }

        console.log(
            'Game lost!'
        );

        this.state = 'lost';

        this.accumulator = 0;

        Input.cleanup();

        UI.hideCharge();

        if (AudioManager) AudioManager.lose();

        UI.showMessage(
            'OH NO! THE PANCAKE FELL! 🥞',
            1800
        );

        /*
         * Brief failure state before automatically preparing
         * another attempt.
         */

        this.clearResultTimer();

        this.resultTimer =
            setTimeout(() => {

                this.resultTimer = null;

                if (
                    this.state !== 'lost'
                ) {
                    return;
                }

                this.reset();

                this.state = 'playing';

                this.lastFrameTime =
                    performance.now();

                this.accumulator = 0;

                UI.setPlayingUI();

                UI.showMessage(
                    'Try again! You’ve got this! 🥞',
                    1800
                );

            }, 1900);
    },

    // --------------------------------------------------------
    // RESULT TIMER
    // --------------------------------------------------------

    clearResultTimer() {

        if (
            this.resultTimer !== null
        ) {

            clearTimeout(
                this.resultTimer
            );

            this.resultTimer = null;
        }
    },

    // --------------------------------------------------------
    // MAIN LOOP
    // --------------------------------------------------------

    gameLoop(timestamp) {

        if (!this.initialized) {
            return;
        }

        /*
         * First frame.
         */

        if (
            this.lastFrameTime === 0
        ) {

            this.lastFrameTime =
                timestamp;
        }

        /*
         * Calculate elapsed real time.
         *
         * Clamp large gaps so returning from a backgrounded
         * mobile tab cannot generate hundreds of physics steps.
         */

        let frameDelta =
            timestamp -
            this.lastFrameTime;

        this.lastFrameTime =
            timestamp;

        frameDelta =
            Math.min(
                Math.max(frameDelta, 0),
                this.maxFrameDelta
            );

        /*
         * Add elapsed time to the fixed timestep accumulator.
         */

        this.accumulator +=
            frameDelta;

        /*
         * Run deterministic physics steps.
         */

        let physicsSteps = 0;

        while (
            this.accumulator >= this.FIXED_STEP &&
            physicsSteps < this.maxPhysicsStepsPerFrame
        ) {

            this.fixedUpdate();

            this.accumulator -=
                this.FIXED_STEP;

            physicsSteps++;

            /*
             * If the game ended during a physics step,
             * discard any remaining accumulated simulation
             * time.
             */

            if (
                this.state !== 'playing'
            ) {

                this.accumulator = 0;

                break;
            }
        }

        /*
         * If the device was extremely slow and we hit the
         * safety limit, discard the remaining backlog rather
         * than attempting to catch up indefinitely.
         */

        if (
            physicsSteps >=
            this.maxPhysicsStepsPerFrame
        ) {

            this.accumulator = 0;
        }

        /*
         * Presentation happens once per rendered frame.
         */

        this.renderUpdate();

        /*
         * Renderer.update() intentionally remains a
         * compatibility hook. Pixi's Application ticker
         * owns actual rendering.
         */

        Renderer.update();

        /*
         * Continue the render loop.
         */

        requestAnimationFrame(
            (time) => this.gameLoop(time)
        );
    }
};


// ============================================================
// BOOT
// ============================================================

window.addEventListener(
    'load',
    () => {

        try {

            Game.init();

        } catch (error) {

            console.error(
                'Failed to initialize Pancake Plop:',
                error
            );
        }
    }
);