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
        environment: new Map(), // store graphics objects by key
        obstacles: new Map(),
        pancake: null,
        particles: []
    },
    
    init() {
        // Create Pixi Application
        this.app = new PIXI.Application({
            width: CONFIG.canvasWidth,
            height: CONFIG.canvasHeight,
            backgroundColor: 0xfef3e2,
            antialias: true,
            resolution: Math.max(window.devicePixelRatio || 1, 1.5),
            autoDensity: true,
        });
        
        // Add canvas to container
        const container = document.getElementById('pixi-container');
        container.appendChild(this.app.view);
        
        this.stage = this.app.stage;
        
        // Create layers
        this.layers.background = new PIXI.Container();
        this.layers.environment = new PIXI.Container();
        this.layers.obstacles = new PIXI.Container();
        this.layers.pancake = new PIXI.Container();
        this.layers.particles = new PIXI.Container();
        this.layers.effects = new PIXI.Container();
        this.layers.ui = new PIXI.Container();
        
        // Add layers to stage in order
        this.stage.addChild(this.layers.background);
        this.stage.addChild(this.layers.environment);
        this.stage.addChild(this.layers.obstacles);
        this.stage.addChild(this.layers.pancake);
        this.stage.addChild(this.layers.particles);
        this.stage.addChild(this.layers.effects);
        this.stage.addChild(this.layers.ui);
        
        // Set up resize handling
        window.addEventListener('resize', () => this.handleResize());
        
        console.log('PixiJS renderer initialized');
    },
    
    handleResize() {
        const container = document.getElementById('game-container');
        const rect = container.getBoundingClientRect();
        const scaleX = rect.width / CONFIG.canvasWidth;
        const scaleY = rect.height / CONFIG.canvasHeight;
        const scale = Math.min(scaleX, scaleY);
        
        this.app.renderer.resize(rect.width, rect.height);
        this.stage.scale.set(scale);
        this.stage.x = (rect.width - CONFIG.canvasWidth * scale) / 2;
        this.stage.y = (rect.height - CONFIG.canvasHeight * scale) / 2;
    },
    
    // Helper to create a Graphics object with common settings
    createGraphics() {
        return new PIXI.Graphics();
    },
    
    // Clear a layer and all tracked graphics
    clearLayer(layerName) {
        if (this.layers[layerName]) {
            this.layers[layerName].removeChildren();
        }
        if (layerName === 'environment') {
            this.graphics.environment.clear();
        }
        if (layerName === 'obstacles') {
            this.graphics.obstacles.clear();
        }
    },
    
    // Add a graphics object to a layer and track it
    addToLayer(layerName, graphics, key) {
        if (this.layers[layerName]) {
            this.layers[layerName].addChild(graphics);
            if (key) {
                if (layerName === 'environment') {
                    this.graphics.environment.set(key, graphics);
                } else if (layerName === 'obstacles') {
                    this.graphics.obstacles.set(key, graphics);
                }
            }
        }
    },
    
    // Remove a tracked graphics object
    removeFromLayer(layerName, key) {
        if (this.layers[layerName] && key) {
            if (layerName === 'environment') {
                const g = this.graphics.environment.get(key);
                if (g) {
                    this.layers[layerName].removeChild(g);
                    this.graphics.environment.delete(key);
                }
            } else if (layerName === 'obstacles') {
                const g = this.graphics.obstacles.get(key);
                if (g) {
                    this.layers[layerName].removeChild(g);
                    this.graphics.obstacles.delete(key);
                }
            }
        }
    },
    
    // Render loop
    update() {
        // We'll update positions in each module's update method
        // Here we just render the Pixi stage
        this.app.renderer.render(this.stage);
    }
};

window.Renderer = Renderer;