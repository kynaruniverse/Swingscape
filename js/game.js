// Main Game Controller - PixiJS Integrated
const Game = {
    state: 'menu', // menu, playing, won, lost
    chargeIndicator: null,

    init() {
        console.log('Initializing game...');

        // Set canvas dimensions in CONFIG
        CONFIG.canvasWidth = 420;
        CONFIG.canvasHeight = 750;

        // Initialize renderer first
        Renderer.init();

        // Initialize other systems
        Physics.init();
        Particles.init();
        Obstacles.init();
        Pancake.init();
        Input.init();
        UI.init();

        // Create charge indicator graphics
        this.chargeIndicator = new PIXI.Graphics();
        Renderer.layers.ui.addChild(this.chargeIndicator);

        console.log('All systems initialized');
        this.gameLoop();
    },

    start() {
        UI.hideOverlay();
        this.state = 'playing';
        this.reset();
        UI.showMessage('Press anywhere to flip! 🥞');
    },

    reset() {
        console.log('Resetting game');
        Input.cleanup();
        Physics.clearWorld();
        Particles.init(); // reinitializes particle container
        Obstacles.init();
        Pancake.init();
        Input.init();
        this.state = 'playing';
        console.log('Game reset complete');
    },

    win() {
        console.log('Game won!');
        this.state = 'won';
        UI.showMessage('PERFECT LANDING! 🎉🥞');
        const plate = Obstacles.items.find(item => item.label === 'plate');
        if (plate) Particles.createWin(plate.position.x, plate.position.y);
        setTimeout(() => UI.showRestartButton(), 2000);
    },

    lose() {
        console.log('Game lost');
        this.state = 'lost';
        UI.showMessage('Oops! The pancake fell! 🥞');
        setTimeout(() => this.reset(), 2000);
    },

    update() {
        if (this.state === 'playing') {
            Physics.update();
            Pancake.updateTrail();
            Particles.update();
            Pancake.checkFell();

            // Update visuals
            Pancake.updateGraphics();
            Obstacles.updateGraphics();
            Environment.update();

            // Update UI
            UI.updateFlipCounter(Pancake.flipCount);

            // Update charge indicator
            this.updateChargeIndicator();
        }
    },

    updateChargeIndicator() {
        this.chargeIndicator.clear();
        if (Input.isCharging) {
            const x = Pancake.body.position.x;
            const y = Pancake.body.position.y;
            const barWidth = 100;
            const barHeight = 12;
            const barX = x - barWidth / 2;
            const barY = y - 50;
            const percent = Input.getChargePercent();

            // Glow
            this.chargeIndicator.beginFill(0xffc800, 0.2);
            this.chargeIndicator.drawCircle(x, barY, 60);
            this.chargeIndicator.endFill();

            // Background
            this.chargeIndicator.beginFill(0x000000, 0.3);
            this.chargeIndicator.drawRoundedRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6, 8);
            this.chargeIndicator.endFill();

            // Fill
            const fillColor = 0xffd700 + (0xff3300 - 0xffd700) * percent;
            this.chargeIndicator.beginFill(fillColor);
            this.chargeIndicator.drawRoundedRect(barX, barY, barWidth * percent, barHeight, 5);
            this.chargeIndicator.endFill();
        }
    },

    gameLoop() {
        this.update();
        Renderer.update();
        requestAnimationFrame(() => this.gameLoop());
    }
};

window.onload = () => {
    Game.init();
};