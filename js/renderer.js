// Renderer - PixiJS Application Setup
const Renderer = {
    app: null,
    stage: null,

    layers: {
        background: null,
        environment: null,
        obstacles: null,
        pancake: null,
        particles: null,
        effects: null,
        ui: null
    },

    graphics: {
        environment: new Map(),
        obstacles: new Map(),
        pancake: null,
        particles: []
    },

    initialized: false,

    init() {
        // Prevent accidental double initialization.
        if (this.initialized) {
            return;
        }

        const container = document.getElementById('pixi-container');

        if (!container) {
            console.error('Renderer: #pixi-container was not found.');
            return;
        }

        // Make sure the container is clean.
        container.innerHTML = '';

        // Create Pixi application.
        this.app = new PIXI.Application({
            width: CONFIG.canvasWidth,
            height: CONFIG.canvasHeight,
            backgroundColor: 0xfef3e2,
            antialias: true,
            resolution: Math.max(window.devicePixelRatio || 1, 1),
            autoDensity: true,
            powerPreference: 'high-performance'
        });

        // Keep the Pixi canvas completely inside our game container.
        const view = this.app.view;

        view.style.position = 'absolute';
        view.style.left = '0';
        view.style.top = '0';
        view.style.width = '100%';
        view.style.height = '100%';
        view.style.display = 'block';
        view.style.touchAction = 'none';

        container.appendChild(view);

        this.stage = this.app.stage;

        // Create rendering layers.
        this.layers.background = new PIXI.Container();
        this.layers.environment = new PIXI.Container();
        this.layers.obstacles = new PIXI.Container();
        this.layers.pancake = new PIXI.Container();
        this.layers.particles = new PIXI.Container();
        this.layers.effects = new PIXI.Container();
        this.layers.ui = new PIXI.Container();

        // Give each layer a predictable z-index.
        this.layers.background.zIndex = 0;
        this.layers.environment.zIndex = 10;
        this.layers.obstacles.zIndex = 20;
        this.layers.pancake.zIndex = 30;
        this.layers.particles.zIndex = 40;
        this.layers.effects.zIndex = 50;
        this.layers.ui.zIndex = 100;

        this.stage.sortableChildren = true;

        // Add layers in rendering order.
        this.stage.addChild(this.layers.background);
        this.stage.addChild(this.layers.environment);
        this.stage.addChild(this.layers.obstacles);
        this.stage.addChild(this.layers.pancake);
        this.stage.addChild(this.layers.particles);
        this.stage.addChild(this.layers.effects);
        this.stage.addChild(this.layers.ui);

        // Initial sizing.
        this.handleResize();

        // Handle future resizing.
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle orientation changes on mobile.
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });

        this.initialized = true;

        console.log('PixiJS renderer initialized');
    },

    handleResize() {
        if (!this.app || !this.stage) {
            return;
        }

        const container = document.getElementById('game-container');

        if (!container) {
            return;
        }

        const rect = container.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
            return;
        }

        /*
         * The game itself always uses the logical resolution:
         *
         *     420 x 750
         *
         * The Pixi canvas, however, needs to physically match the
         * size of the browser container.
         */
        this.app.renderer.resize(rect.width, rect.height);

        // Calculate a uniform scale so the entire game remains visible.
        const scaleX = rect.width / CONFIG.canvasWidth;
        const scaleY = rect.height / CONFIG.canvasHeight;

        const scale = Math.min(scaleX, scaleY);

        this.stage.scale.set(scale);

        // Center the logical game inside the available canvas.
        this.stage.x = (rect.width - CONFIG.canvasWidth * scale) / 2;
        this.stage.y = (rect.height - CONFIG.canvasHeight * scale) / 2;
    },

    createGraphics() {
        return new PIXI.Graphics();
    },

    clearLayer(layerName) {
        const layer = this.layers[layerName];

        if (!layer) {
            return;
        }

        // Remove all children from the requested layer.
        layer.removeChildren();

        // Destroy old graphics belonging to the layer.
        if (layerName === 'environment') {
            this.graphics.environment.forEach(graphic => {
                if (graphic && !graphic.destroyed) {
                    graphic.destroy({
                        children: true
                    });
                }
            });

            this.graphics.environment.clear();
        }

        if (layerName === 'obstacles') {
            this.graphics.obstacles.forEach(graphic => {
                if (graphic && !graphic.destroyed) {
                    graphic.destroy({
                        children: true
                    });
                }
            });

            this.graphics.obstacles.clear();
        }

        if (layerName === 'pancake') {
            this.graphics.pancake = null;
        }

        if (layerName === 'particles') {
            this.graphics.particles = [];
        }
    },

    addToLayer(layerName, graphics, key = null) {
        const layer = this.layers[layerName];

        if (!layer || !graphics) {
            return;
        }

        layer.addChild(graphics);

        if (key) {
            if (layerName === 'environment') {
                this.graphics.environment.set(key, graphics);
            }

            if (layerName === 'obstacles') {
                this.graphics.obstacles.set(key, graphics);
            }
        }
    },

    removeFromLayer(layerName, key) {
        const layer = this.layers[layerName];

        if (!layer || !key) {
            return;
        }

        let graphics = null;

        if (layerName === 'environment') {
            graphics = this.graphics.environment.get(key);

            if (graphics) {
                this.graphics.environment.delete(key);
            }
        }

        if (layerName === 'obstacles') {
            graphics = this.graphics.obstacles.get(key);

            if (graphics) {
                this.graphics.obstacles.delete(key);
            }
        }

        if (graphics) {
            if (graphics.parent === layer) {
                layer.removeChild(graphics);
            }

            if (!graphics.destroyed) {
                graphics.destroy({
                    children: true
                });
            }
        }
    },

    clearAllLayers() {
        Object.keys(this.layers).forEach(layerName => {
            this.clearLayer(layerName);
        });
    },

    update() {
        if (!this.app || !this.stage) {
            return;
        }

        /*
         * Pixi's Application normally has its own ticker.
         * The existing game architecture explicitly calls Renderer.update(),
         * so we keep this method for compatibility.
         *
         * We only render manually when auto rendering is disabled.
         */
        if (this.app.renderer) {
            this.app.renderer.render(this.stage);
        }
    }
};

window.Renderer = Renderer;