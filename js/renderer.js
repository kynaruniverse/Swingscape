const Renderer = {
    app: null,
    layers: {
        environment: null,
        obstacles: null,
        pancake: null,
        effects: null
    },
    graphics: {
        obstacles: new Map()
    },

    init() {
        const container = document.getElementById('pixi-container');
        if (!container) return;
        
        this.app = new PIXI.Application({
            width: CONFIG.canvasWidth,
            height: CONFIG.canvasHeight,
            backgroundColor: CONFIG.colors.background,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundAlpha: 0,
            sharedTicker: false
        });
        this.app.ticker.stop();
        container.appendChild(this.app.view);
        
        this.layers.environment = new PIXI.Container();
        this.layers.obstacles = new PIXI.Container();
        this.layers.pancake = new PIXI.Container();
        this.layers.effects = new PIXI.Container();
        
        this.app.stage.addChild(this.layers.environment);
        this.app.stage.addChild(this.layers.obstacles);
        this.app.stage.addChild(this.layers.pancake);
        this.app.stage.addChild(this.layers.effects);
    },

    createGraphics() {
        return new PIXI.Graphics();
    },

    addToLayer(layerName, graphic, id) {
        if (this.layers[layerName]) {
            this.layers[layerName].addChild(graphic);
            if (layerName === 'obstacles' && id) {
                this.graphics.obstacles.set(id, graphic);
            }
        }
    },

    clearLayer(layerName) {
        if (this.layers[layerName]) {
            this.layers[layerName].removeChildren().forEach(child => child.destroy());
            if (layerName === 'obstacles') {
                this.graphics.obstacles.clear();
            }
        }
    },

    render() {
        if (this.app && this.app.renderer) {
            this.app.renderer.render(this.app.stage);
        }
    }
};
window.Renderer = Renderer;
