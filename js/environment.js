// ============================================================
// PANCAKE PLOP!   KITCHEN ENVIRONMENT
// Visual-only kitchen scene
// ============================================================
const Environment = {
    graphics: {
        background: null,
        kitchenWall: null,
        window: null,
        counter: null,
        dustContainer: null,
        dustMotes: []
    },
    steamParticles: [],

    init() {
        if (!Renderer || !Renderer.layers.environment) return;
        Renderer.clearLayer('environment');
        
        this.graphics = { background: null, kitchenWall: null, window: null, counter: null, dustContainer: null, dustMotes: [] };
        this.steamParticles = [];
        
        this.drawBackground();
        this.drawKitchenWall();
        this.drawWindow();
        this.drawCounter();
        this.createDustMotes();
        this.createSteam();
    },
    drawBackground() {
        const g = Renderer.createGraphics();
        g.beginFill(CONFIG.colors.background);
        g.drawRect(0, 0, CONFIG.canvasWidth, CONFIG.counterY);
        g.endFill();
        Renderer.addToLayer('environment', g, 'background');
        this.graphics.background = g;
    },
    drawKitchenWall() {
        const g = Renderer.createGraphics();
        const tileWidth = 60;
        const tileHeight = 50;
        const rows = Math.ceil(CONFIG.counterY / tileHeight);
        const columns = Math.ceil(CONFIG.canvasWidth / tileWidth);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const x = col * tileWidth;
                const y = row * tileHeight;
                const tileColor = (row + col) % 2 === 0 ? CONFIG.colors.wallTile : CONFIG.colors.wall;
                g.beginFill(tileColor);
                g.drawRoundedRect(x + 1, y + 1, tileWidth - 2, tileHeight - 2, 3);
                g.endFill();
            }
        }
        g.lineStyle(1, 0xcdbba6, 0.20);
        for (let x = 0; x <= CONFIG.canvasWidth; x += tileWidth) {
            g.moveTo(x, 0);
            g.lineTo(x, CONFIG.counterY);
        }
        for (let y = 0; y <= CONFIG.counterY; y += tileHeight) {
            g.moveTo(0, y);
            g.lineTo(CONFIG.canvasWidth, y);
        }
        Renderer.addToLayer('environment', g, 'kitchenWall');
        this.graphics.kitchenWall = g;
    },
    drawWindow() {
        const g = Renderer.createGraphics();
        const windowWidth = 118;
        const windowHeight = 92;
        const windowX = (CONFIG.canvasWidth - windowWidth) / 2;
        const windowY = 38;
        
        g.beginFill(0x000000, 0.08);
        g.drawRoundedRect(windowX - 9, windowY - 6, windowWidth + 18, windowHeight + 18, 8);
        g.endFill();
        g.beginFill(CONFIG.colors.windowFrame);
        g.drawRoundedRect(windowX - 7, windowY - 7, windowWidth + 14, windowHeight + 14, 7);
        g.endFill();
        g.beginFill(0xcfe8f8);
        g.drawRoundedRect(windowX, windowY, windowWidth, windowHeight, 3);
        g.endFill();
        
        g.beginFill(0xffffff, 0.45);
        g.drawCircle(windowX + 27, windowY + 25, 9);
        g.drawCircle(windowX + 38, windowY + 22, 12);
        g.drawCircle(windowX + 50, windowY + 26, 8);
        g.endFill();
        
        g.beginFill(CONFIG.colors.windowFrame);
        g.drawRect(windowX + windowWidth / 2 - 3, windowY, 6, windowHeight);
        g.drawRect(windowX, windowY + windowHeight / 2 - 3, windowWidth, 6);
        g.endFill();
        
        this.drawCurtains(g, windowX, windowY, windowWidth, windowHeight);
        Renderer.addToLayer('environment', g, 'window');
        this.graphics.window = g;
    },
    drawCurtains(g, windowX, windowY, windowWidth, windowHeight) {
        const curtainColor = 0xffb8c6;
        g.beginFill(curtainColor);
        g.moveTo(windowX - 9, windowY - 8);
        g.quadraticCurveTo(windowX - 22, windowY + windowHeight * 0.45, windowX - 8, windowY + windowHeight + 8);
        g.lineTo(windowX + 4, windowY + windowHeight + 8);
        g.quadraticCurveTo(windowX - 1, windowY + windowHeight * 0.45, windowX + 4, windowY - 8);
        g.closePath();
        g.endFill();
        
        g.beginFill(curtainColor);
        g.moveTo(windowX + windowWidth - 4, windowY - 8);
        g.quadraticCurveTo(windowX + windowWidth + 1, windowY + windowHeight * 0.45, windowX + windowWidth - 8, windowY + windowHeight + 8);
        g.lineTo(windowX + windowWidth + 9, windowY + windowHeight + 8);
        g.quadraticCurveTo(windowX + windowWidth + 22, windowY + windowHeight * 0.45, windowX + windowWidth + 9, windowY - 8);
        g.closePath();
        g.endFill();
    },
    drawCounter() {
        const g = Renderer.createGraphics();
        const counterY = CONFIG.counterY;
        
        g.beginFill(0x704b32, 0.18);
        g.drawRect(0, counterY - 3, CONFIG.canvasWidth, 16);
        g.endFill();
        g.beginFill(CONFIG.colors.counterTop);
        g.drawRect(0, counterY - 12, CONFIG.canvasWidth, 18);
        g.endFill();
        g.beginFill(CONFIG.colors.counter);
        g.drawRect(0, counterY + 6, CONFIG.canvasWidth, Math.max(0, CONFIG.canvasHeight - counterY - 6));
        g.endFill();
        
        g.beginFill(0xffffff, 0.30);
        g.drawRect(0, counterY - 12, CONFIG.canvasWidth, 3);
        g.endFill();
        g.beginFill(CONFIG.colors.counterSide, 0.35);
        g.drawRect(0, counterY + 6, CONFIG.canvasWidth, 4);
        g.endFill();
        
        g.lineStyle(1, CONFIG.colors.counterSide, 0.12);
        for (let i = 0; i < 14; i++) {
            const y = counterY + 18 + i * 8;
            g.moveTo(0, y);
            g.quadraticCurveTo(CONFIG.canvasWidth * 0.25, y - 2, CONFIG.canvasWidth * 0.5, y);
            g.quadraticCurveTo(CONFIG.canvasWidth * 0.75, y + 2, CONFIG.canvasWidth, y - 1);
        }
        Renderer.addToLayer('environment', g, 'counter');
        this.graphics.counter = g;
    },
    createDustMotes() {
        const container = new PIXI.Container();
        container.zIndex = 5;
        Renderer.layers.environment.addChild(container);
        this.graphics.dustContainer = container;
        this.graphics.dustMotes = [];
        
        for (let i = 0; i < 10; i++) {
            const mote = new PIXI.Graphics();
            const radius = 1 + Math.random() * 1.5;
            mote.beginFill(0xffffff, 0.18 + Math.random() * 0.20);
            mote.drawCircle(0, 0, radius);
            mote.endFill();
            const baseX = 25 + Math.random() * (CONFIG.canvasWidth - 50);
            const baseY = 155 + Math.random() * 360;
            mote.x = baseX;
            mote.y = baseY;
            container.addChild(mote);
            this.graphics.dustMotes.push({
                graphic: mote, baseX, baseY,
                offset: Math.random() * Math.PI * 2,
                speed: 0.25 + Math.random() * 0.45,
                amplitudeX: 8 + Math.random() * 15,
                amplitudeY: 5 + Math.random() * 10
            });
        }
    },
    createSteam() {
        const griddle = Obstacles.items.find(item => item.label === 'griddle');
        if (!griddle) return;
        const gx = griddle.position.x;
        const gy = griddle.position.y;
        
        for (let i = 0; i < 6; i++) {
            const steam = new PIXI.Graphics();
            const radius = 5 + Math.random() * 8;
            steam.beginFill(0xffffff, 0.15);
            steam.drawCircle(0, 0, radius);
            steam.endFill();
            steam.x = gx + (Math.random() - 0.5) * 40;
            steam.y = gy - 10 - Math.random() * 20;
            steam.alpha = 0.2 + Math.random() * 0.2;
            this.steamParticles.push({
                graphic: steam, baseX: steam.x, baseY: steam.y,
                speed: 0.2 + Math.random() * 0.3,
                drift: (Math.random() - 0.5) * 0.5,
                scale: 0.8 + Math.random() * 0.6,
                phase: Math.random() * 100
            });
            Renderer.layers.environment.addChild(steam);
        }
    },
    update() {
        if (!this.graphics || !this.graphics.dustMotes) return;
        const time = performance.now() / 1000;
        this.graphics.dustMotes.forEach(mote => {
            if (!mote.graphic) return;
            mote.graphic.x = mote.baseX + Math.sin(time * mote.speed + mote.offset) * mote.amplitudeX;
            mote.graphic.y = mote.baseY + Math.cos(time * mote.speed * 0.7 + mote.offset) * mote.amplitudeY;
            mote.graphic.alpha = 0.65 + Math.sin(time * mote.speed + mote.offset) * 0.2;
        });
        
        this.steamParticles.forEach(p => {
            const yOff = Math.sin(time * p.speed + p.phase) * 8;
            const xOff = Math.cos(time * p.drift + p.phase) * 6;
            p.graphic.x = p.baseX + xOff;
            p.graphic.y = p.baseY - Math.abs(yOff) - 2;
            p.graphic.alpha = 0.15 + 0.1 * Math.sin(time * p.speed + p.phase);
            p.graphic.scale.set(p.scale * (0.9 + 0.2 * Math.sin(time * p.speed + p.phase)));
        });
    }
};
window.Environment = Environment;
