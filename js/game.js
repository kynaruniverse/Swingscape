// Main Game Controller
//
// Coordinates the physics, rendering, environment, pancake,
// particles, input and DOM UI systems.

const Game = {
    state: 'menu',

    chargeIndicator: null,

    initialized: false,

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
         * Single source of truth for game dimensions.
         */
        CONFIG.canvasWidth = 420;
        CONFIG.canvasHeight = 750;

        /*
         * Rendering first.
         */
        Renderer.init();

        /*
         * Physics.
         */
        Physics.init();

        /*
         * Particles.
         */
        Particles.init();

        /*
         * Static game objects.
         */
        Obstacles.init();

        /*
         * Environment MUST be initialized after Obstacles,
         * because the plate renderer reads the plate body.
         */
        Environment.init();

        /*
         * Player.
         */
        Pancake.init();

        /*
         * Input and DOM UI.
         */
        Input.init();
        UI.init();

        /*
         * The charge UI is DOM-based now.
         * Keep this property for compatibility with any code
         * that might reference Game.chargeIndicator.
         */
        this.chargeIndicator = null;

        this.state = 'menu';
        this.initialized = true;

        UI.setStartScreen();
        UI.showOverlay();

        console.log(
            'All systems initialized.'
        );

        this.gameLoop();
    },

    start() {
        console.log(
            'Starting level...'
        );

        this.reset();

        this.state = 'playing';

        UI.setPlayingUI();

        UI.showMessage(
            'Hold to charge, release to flip! 🥞',
            2400
        );
    },

    reset() {
        console.log(
            'Resetting game...'
        );

        /*
         * Stop any active input state.
         */
        Input.cleanup();

        /*
         * Clear the existing Matter world.
         *
         * Important:
         * Physics.clearWorld() clears the world but the engine
         * itself remains available, preserving the collision
         * event handlers established during Physics.init().
         */
        Physics.clearWorld();

        /*
         * Rebuild particles.
         */
        Particles.init();

        /*
         * Rebuild obstacles.
         */
        Obstacles.init();

        /*
         * Rebuild environment so plate/counter visuals correspond
         * to the newly created obstacle bodies.
         */
        Environment.init();

        /*
         * Rebuild pancake.
         */
        Pancake.init();

        /*
         * Rebind input state.
         *
         * Input.init() is now responsible for removing any previous
         * DOM listeners before registering new ones.
         */
        Input.init();

        this.state = 'playing';

        UI.updateFlipCounter(
            Pancake.flipCount
        );

        UI.updateLevel(1);
        UI.hideCharge();

        console.log(
            'Game reset complete.'
        );
    },

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

        UI.hideCharge();

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
            999999
        );

        /*
         * Give the celebration particles time to play before
         * presenting the replay button.
         */
        setTimeout(() => {
            if (this.state !== 'won') {
                return;
            }

            UI.setRestartScreen();
            UI.showOverlay();
        }, 1400);
    },

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

        UI.hideCharge();

        UI.showMessage(
            'OH NO! THE PANCAKE FELL! 🥞',
            1800
        );

        /*
         * Briefly show the failure state before restarting.
         */
        setTimeout(() => {
            if (this.state !== 'lost') {
                return;
            }

            this.reset();

            this.state = 'playing';

            UI.setPlayingUI();

            UI.showMessage(
                'Try again! You’ve got this! 🥞',
                1800
            );
        }, 1900);
    },

    update() {
        if (
            this.state !== 'playing'
        ) {
            /*
             * Particles should still animate during the win state.
             */
            if (
                this.state === 'won'
            ) {
                Particles.update();
            }

            Environment.update();

            return;
        }

        /*
         * Physics.
         */
        Physics.update();

        /*
         * Pancake trail.
         */
        Pancake.updateTrail();

        /*
         * Particles.
         */
        Particles.update();

        /*
         * Fell detection.
         */
        Pancake.checkFell();

        /*
         * Visual updates.
         */
        Pancake.updateGraphics();
        Pancake.drawPancakeGraphics();

        Obstacles.updateGraphics();
        Environment.update();

        /*
         * HUD.
         */
        UI.updateFlipCounter(
            Pancake.flipCount
        );

        /*
         * Charge UI.
         */
        if (Input.isCharging) {
            UI.showCharge(
                Input.getChargePercent()
            );
        } else {
            UI.hideCharge();
        }
    },

    gameLoop() {
        this.update();

        Renderer.update();

        requestAnimationFrame(
            () => this.gameLoop()
        );
    }
};

window.onload = () => {
    try {
        Game.init();
    } catch (error) {
        console.error(
            'Failed to initialize Pancake Plop:',
            error
        );
    }
};