// Environment - PixiJS Rendering
const Environment = {
    graphics: {
        background: null,
        kitchenWall: null,
        window: null,
        counter: null,
        griddle: null,
        plate: null,
        dustMotes: [],
    },
    
    init() {
        // Clear previous environment
        Renderer.clearLayer('environment');
        this.graphics = {
            background: null,
            kitchenWall: null,
            window: null,
            counter: null,
            griddle: null,
            plate: null,
            dustMotes: [],
        };
        
        this.drawBackground();
        this.drawKitchenWall();
        this.drawWindow();
        this.drawCounter();
        this.drawGriddle();
        this.drawPlate();
        this.createDustMotes();
    },
    
    drawBackground() {
        const g = Renderer.createGraphics();
        // Sky gradient
        const gradient = new PIXI.FillGradient(0, 0, 0, CONFIG.counterY);
        gradient.addColorStop(0, 0xfef8f0);
        gradient.addColorStop(1, 0xf5e6d3);
        g.beginFill(gradient);
        g.drawRect(0, 0, CONFIG.canvasWidth, CONFIG.counterY);
        g.endFill();
        
        Renderer.addToLayer('environment', g, 'background');
        this.graphics.background = g;
    },
    
    drawKitchenWall() {
        const g = Renderer.createGraphics();
        const tileSize = 60;
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 8; col++) {
                const fill = row % 2 === 0 ? 0xfff5e8 : 0xf5e6d3;
                g.beginFill(fill);
                g.drawRect(col * tileSize, row * tileSize, tileSize - 2, tileSize - 2);
                g.endFill();
                
                g.lineStyle(1, 0x000000, 0.05);
                g.drawRect(col * tileSize, row * tileSize, tileSize - 2, tileSize - 2);
            }
        }
        Renderer.addToLayer('environment', g, 'kitchenWall');
        this.graphics.kitchenWall = g;
    },
    
    drawWindow() {
        const g = Renderer.createGraphics();
        const windowX = CONFIG.canvasWidth / 2 - 55;
        const windowY = 40;
        const windowW = 110;
        const windowH = 90;
        
        // Frame
        g.beginFill(CONFIG.colors.windowFrame);
        g.drawRect(windowX - 8, windowY - 8, windowW + 16, windowH + 16);
        g.endFill();
        
        // Glass gradient
        const glassGradient = new PIXI.FillGradient(windowX, windowY, windowX, windowY + windowH);
        glassGradient.addColorStop(0, 0xc8e4f8);
        glassGradient.addColorStop(1, 0xe8f4fc);
        g.beginFill(glassGradient);
        g.drawRect(windowX, windowY, windowW, windowH);
        g.endFill();
        
        // Cross bars
        g.beginFill(CONFIG.colors.windowFrame);
        g.drawRect(windowX + windowW/2 - 3, windowY, 6, windowH);
        g.drawRect(windowX, windowY + windowH/2 - 3, windowW, 6);
        g.endFill();
        
        // Curtains
        g.beginFill(0xffb6c1);
        g.moveTo(windowX - 8, windowY - 8);
        g.quadraticCurveTo(windowX - 20, windowY + windowH/2, windowX - 8, windowY + windowH + 8);
        g.fill();
        g.moveTo(windowX + windowW + 8, windowY - 8);
        g.quadraticCurveTo(windowX + windowW + 20, windowY + windowH/2, windowX + windowW + 8, windowY + windowH + 8);
        g.fill();
        
        Renderer.addToLayer('environment', g, 'window');
        this.graphics.window = g;
    },
    
    drawCounter() {
        const g = Renderer.createGraphics();
        // Left section
        g.beginFill(CONFIG.colors.counter);
        g.drawRect(0, CONFIG.counterY - 10, 130, 20);
        g.endFill();
        g.beginFill(CONFIG.colors.counterSide);
        g.drawRect(130, CONFIG.counterY - 5, 30, 15);
        g.endFill();
        // Right section
        g.beginFill(CONFIG.colors.counter);
        g.drawRect(CONFIG.canvasWidth - 120, CONFIG.counterY - 10, 120, 20);
        g.endFill();
        g.beginFill(CONFIG.colors.counterSide);
        g.drawRect(CONFIG.canvasWidth - 150, CONFIG.counterY - 5, 30, 15);
        g.endFill();
        
        // Top highlight
        g.beginFill(0xffffff, 0.3);
        g.drawRect(0, CONFIG.counterY - 10, 130, 2);
        g.drawRect(CONFIG.canvasWidth - 120, CONFIG.counterY - 10, 120, 2);
        g.endFill();
        
        // Wood grain lines
        g.lineStyle(1, 0x000000, 0.1);
        for (let i = 0; i < 6; i++) {
            const y = CONFIG.counterY + i * 3 - 8;
            g.moveTo(0, y);
            g.lineTo(130, y);
            g.moveTo(CONFIG.canvasWidth - 120, y);
            g.lineTo(CONFIG.canvasWidth, y);
        }
        
        Renderer.addToLayer('environment', g, 'counter');
        this.graphics.counter = g;
    },
    
    drawGriddle() {
        const g = Renderer.createGraphics();
        const griddleY = CONFIG.counterY - 15;
        
        // Griddle body
        g.beginFill(0x555555);
        g.drawRect(CONFIG.startX - 45, griddleY - 10, 90, 12);
        g.endFill();
        // Surface
        g.beginFill(0x666666);
        g.drawRect(CONFIG.startX - 45, griddleY - 12, 90, 4);
        g.endFill();
        
        // Heat glow (radial gradient simulation with circles)
        const glowGradient = new PIXI.FillGradient(CONFIG.startX, griddleY, CONFIG.startX, griddleY);
        glowGradient.addColorStop(0, 0xff4400, 0.3);
        glowGradient.addColorStop(1, 0xff4400, 0);
        // Use a circle to simulate glow
        g.beginFill(0xff4400, 0.2);
        g.drawCircle(CONFIG.startX, griddleY, 50);
        g.endFill();
        
        // Hot elements
        g.beginFill(0xff4422);
        for (let i = 0; i < 4; i++) {
            g.drawRect(CONFIG.startX - 35 + i * 20, griddleY - 8, 10, 3);
        }
        g.endFill();
        
        // Steam wisps (will be animated later; here static placeholder)
        g.lineStyle(2, 0xffffff, 0.4);
        const time = Date.now() / 1000;
        for (let i = 0; i < 3; i++) {
            const steamX = CONFIG.startX - 30 + i * 25 + Math.sin(time + i) * 5;
            const steamY = griddleY - 15 - Math.sin(time * 2 + i) * 10;
            g.moveTo(steamX, steamY);
            g.quadraticCurveTo(steamX + Math.sin(time + i) * 8, steamY - 10, steamX + Math.sin(time + i) * 15, steamY - 20);
        }
        
        Renderer.addToLayer('environment', g, 'griddle');
        this.graphics.griddle = g;
    },
    
    drawPlate() {
        const g = Renderer.createGraphics();
        const plate = Obstacles.items.find(item => item.label === 'plate');
        if (!plate) return;
        
        const plateX = plate.position.x;
        const plateY = plate.position.y;
        
        // Shadow
        g.beginFill(0x000000, 0.2);
        g.drawEllipse(plateX, plateY + 5, 55, 8);
        g.endFill();
        // Plate base
        g.beginFill(0xffffff);
        g.drawEllipse(plateX, plateY - 5, 55, 12);
        g.endFill();
        // Inner plate
        g.beginFill(0xf5f5f5);
        g.drawEllipse(plateX, plateY - 6, 45, 9);
        g.endFill();
        // Gold dots
        g.beginFill(0xffd700);
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const dotX = plateX + Math.cos(angle) * 35;
            const dotY = plateY - 5 + Math.sin(angle) * 6;
            g.drawCircle(dotX, dotY, 3);
        }
        g.endFill();
        
        Renderer.addToLayer('environment', g, 'plate');
        this.graphics.plate = g;
    },
    
    createDustMotes() {
        const dustContainer = new PIXI.Container();
        Renderer.layers.environment.addChild(dustContainer);
        this.graphics.dustMotes = [];
        
        for (let i = 0; i < 8; i++) {
            const mote = new PIXI.Graphics();
            mote.beginFill(0xffc864, 0.4);
            mote.drawCircle(0, 0, 2);
            mote.endFill();
            mote.x = 100 + i * 35;
            mote.y = 100 + i * 40;
            dustContainer.addChild(mote);
            this.graphics.dustMotes.push({
                graphic: mote,
                baseX: mote.x,
                baseY: mote.y,
                offset: i * 2,
                speed: 0.5 + Math.random() * 0.5
            });
        }
    },
    
    update() {
        // Animate dust motes
        const time = Date.now() / 1000;
        this.graphics.dustMotes.forEach(mote => {
            mote.graphic.x = mote.baseX + Math.sin(time * mote.speed + mote.offset) * 30;
            mote.graphic.y = mote.baseY + Math.cos(time * 0.7 + mote.offset) * 20;
        });
        
        // Animate steam on griddle (simple update by redrawing? for now just leave)
        // Could be enhanced later with actual particle system
    }
};

window.Environment = Environment;