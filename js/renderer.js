// ============================================================
// PANCAKE PLOP! — PIXI RENDERER
// Fixed logical game space: 420 × 750
// ============================================================

const Renderer = {

    // --------------------------------------------------------
    // PIXI REFERENCES
    // --------------------------------------------------------

    app: null,
    stage: null,

    // --------------------------------------------------------
    // EVENT HANDLER REFERENCES
    // --------------------------------------------------------

    resizeHandler: null,
    orientationHandler: null,

    // --------------------------------------------------------
    // RENDER LAYERS
    // --------------------------------------------------------

    layers: {
        background: null,
        environment: null,
        obstacles: null,
        pancake: null,
        particles: null,
        effects: null,
        ui: null
    },

    // --------------------------------------------------------
    // GRAPHICS REFERENCES
    // --------------------------------------------------------

    graphics: {
        environment: new Map(),
        obstacles: new Map(),
        pancake: null
    },

    initialized: false,

    // --------------------------------------------------------
    // INITIALISE
    // --------------------------------------------------------

    init() {

        if (this.initialized) {
            return;
        }

        const container =
            document.getElementById(
                'pixi-container'
            );

        if (!container) {

            console.error(
                'Renderer: #pixi-container was not found.'
            );

            return;
        }

        /*
         * Keep the renderer container clean.
         */
        container.innerHTML = '';

        /*
         * Pixi renders in the game's fixed logical coordinate
         * system.
         *
         * The DOM/CSS layer handles scaling to the device.
         */
        const resolution =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        this.app =
            new PIXI.Application({

                width:
                    CONFIG.canvasWidth,

                height:
                    CONFIG.canvasHeight,

                backgroundColor:
                    0xfef3e2,

                antialias: true,

                resolution,

                autoDensity: true,

                powerPreference:
                    'high-performance'
            });

        const view =
            this.app.view;

        /*
         * The canvas fills the presentation container.
         *
         * The logical Pixi coordinate system remains
         * 420 × 750.
         */
        view.style.position =
            'absolute';

        view.style.left =
            '0';

        view.style.top =
            '0';

        view.style.width =
            '100%';

        view.style.height =
            '100%';

        view.style.display =
            'block';

        view.style.touchAction =
            'none';

        view.style.userSelect =
            'none';

        container.appendChild(
            view
        );

        this.stage =
            this.app.stage;

        /*
         * Explicitly keep the stage at the logical origin.
         */
        this.stage.position.set(
            0,
            0
        );

        this.stage.scale.set(
            1,
            1
        );

        /*
         * Create rendering layers.
         */
        this.layers.background =
            new PIXI.Container();

        this.layers.environment =
            new PIXI.Container();

        this.layers.obstacles =
            new PIXI.Container();

        this.layers.pancake =
            new PIXI.Container();

        this.layers.particles =
            new PIXI.Container();

        this.layers.effects =
            new PIXI.Container();

        this.layers.ui =
            new PIXI.Container();

        /*
         * Explicit rendering order.
         */
        this.layers.background.zIndex =
            0;

        this.layers.environment.zIndex =
            10;

        this.layers.obstacles.zIndex =
            20;

        this.layers.pancake.zIndex =
            30;

        this.layers.particles.zIndex =
            40;

        this.layers.effects.zIndex =
            50;

        this.layers.ui.zIndex =
            100;

        this.stage.sortableChildren =
            true;

        /*
         * Add the layers to the stage.
         */
        this.stage.addChild(
            this.layers.background
        );

        this.stage.addChild(
            this.layers.environment
        );

        this.stage.addChild(
            this.layers.obstacles
        );

        this.stage.addChild(
            this.layers.pancake
        );

        this.stage.addChild(
            this.layers.particles
        );

        this.stage.addChild(
            this.layers.effects
        );

        this.stage.addChild(
            this.layers.ui
        );

        /*
         * Keep the presentation size synchronized with the
         * browser without changing the game's logical size.
         */
        this.handleResize();

        /*
         * Store listener references so they can be removed.
         */
        this.resizeHandler = () => {
            this.handleResize();
        };

        this.orientationHandler = () => {
            this.handleResize();
        };

        window.addEventListener(
            'resize',
            this.resizeHandler,
            {
                passive: true
            }
        );

        window.addEventListener(
            'orientationchange',
            this.orientationHandler,
            {
                passive: true
            }
        );

        this.initialized =
            true;

        console.log(
            'PixiJS renderer initialized:',
            `${CONFIG.canvasWidth}x${CONFIG.canvasHeight}`,
            `@ ${resolution}x`
        );
    },

    // --------------------------------------------------------
    // UPDATE
    // --------------------------------------------------------

    update() {
        // PixiJS owns actual rendering.
        // Compatibility hook for Game.render loop.
    },

    // --------------------------------------------------------
    // RESIZE
    // --------------------------------------------------------

    handleResize() {

        if (
            !this.app ||
            !this.stage
        ) {
            return;
        }

        /*
         * IMPORTANT:
         *
         * Do not change:
         *
         * this.app.renderer.width
         * this.app.renderer.height
         * this.stage.scale
         * this.stage.position
         *
         * The game always exists in its fixed logical
         * coordinate system.
         *
         * CSS scales the canvas to fit the game container.
         */

        this.stage.position.set(
            0,
            0
        );

        this.stage.scale.set(
            1,
            1
        );
    },

    // --------------------------------------------------------
    // GRAPHICS
    // --------------------------------------------------------

    createGraphics() {

        return new PIXI.Graphics();
    },

    // --------------------------------------------------------
    // CLEAR LAYER
    // --------------------------------------------------------

    clearLayer(layerName) {

        const layer =
            this.layers[layerName];

        if (!layer) {
            return;
        }

        /*
         * Copy children first because the collection changes
         * as children are removed.
         */
        const children =
            [...layer.children];

        children.forEach(
            child => {

                if (
                    child &&
                    child.parent === layer
                ) {

                    layer.removeChild(
                        child
                    );
                }

                if (
                    child &&
                    !child.destroyed
                ) {

                    child.destroy({
                        children: true
                    });
                }
            }
        );

        /*
         * Clear renderer references.
         */
        switch (layerName) {

            case 'environment':

                this.graphics.environment.clear();

                break;

            case 'obstacles':

                this.graphics.obstacles.clear();

                break;

            case 'pancake':

                this.graphics.pancake =
                    null;

                break;
        }
    },

    // --------------------------------------------------------
    // ADD TO LAYER
    // --------------------------------------------------------

    addToLayer(
        layerName,
        displayObject,
        key = null
    ) {

        const layer =
            this.layers[layerName];

        if (
            !layer ||
            !displayObject
        ) {
            return null;
        }

        layer.addChild(
            displayObject
        );

        if (key) {

            if (
                layerName ===
                'environment'
            ) {

                this.graphics.environment.set(
                    key,
                    displayObject
                );
            }

            if (
                layerName ===
                'obstacles'
            ) {

                this.graphics.obstacles.set(
                    key,
                    displayObject
                );
            }

            if (
                layerName ===
                'pancake'
            ) {

                this.graphics.pancake =
                    displayObject;
            }
        }

        return displayObject;
    },

    // --------------------------------------------------------
    // REMOVE FROM LAYER
    // --------------------------------------------------------

    removeFromLayer(
        layerName,
        key
    ) {

        const layer =
            this.layers[layerName];

        if (
            !layer ||
            !key
        ) {
            return;
        }

        let displayObject =
            null;

        switch (layerName) {

            case 'environment':

                displayObject =
                    this.graphics.environment.get(
                        key
                    );

                this.graphics.environment.delete(
                    key
                );

                break;

            case 'obstacles':

                displayObject =
                    this.graphics.obstacles.get(
                        key
                    );

                this.graphics.obstacles.delete(
                    key
                );

                break;
        }

        if (!displayObject) {
            return;
        }

        if (
            displayObject.parent ===
            layer
        ) {

            layer.removeChild(
                displayObject
            );
        }

        if (
            !displayObject.destroyed
        ) {

            displayObject.destroy({
                children: true
            });
        }
    },

    // --------------------------------------------------------
    // CLEAR EVERYTHING
    // --------------------------------------------------------

    clearAllLayers() {

        Object.keys(
            this.layers
        ).forEach(
            layerName => {

                this.clearLayer(
                    layerName
                );
            }
        );

        /*
         * Make absolutely sure renderer references are
         * reset as well.
         */
        this.graphics.environment.clear();
        this.graphics.obstacles.clear();
        this.graphics.pancake = null;
    },

    // --------------------------------------------------------
    // DESTROY
    // --------------------------------------------------------

    destroy() {

        if (!this.app) {
            return;
        }

        /*
         * Remove listeners using stored references.
         */
        if (this.resizeHandler) {
            window.removeEventListener(
                'resize',
                this.resizeHandler
            );
            this.resizeHandler = null;
        }

        if (this.orientationHandler) {
            window.removeEventListener(
                'orientationchange',
                this.orientationHandler
            );
            this.orientationHandler = null;
        }

        this.clearAllLayers();

        if (this.app) {

            this.app.destroy(
                true,
                {
                    children: true
                }
            );
        }

        this.app = null;
        this.stage = null;

        this.layers.background = null;
        this.layers.environment = null;
        this.layers.obstacles = null;
        this.layers.pancake = null;
        this.layers.particles = null;
        this.layers.effects = null;
        this.layers.ui = null;

        this.initialized = false;
    }
};

window.Renderer = Renderer;