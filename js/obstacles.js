// ============================================================
// PANCAKE PLOP!   OBSTACLES
// Matter.js physics bodies + PixiJS visuals
// ============================================================
const Obstacles = {
    items: [],
    plateGlow: null,

    init() {
        if (this.items.length > 0 && Physics.world) {
            this.items.forEach(body => {
                if (body) Physics.removeBody(body);
            });
        }
        this.items = [];
        Renderer.clearLayer('obstacles');
        
        this.createCounters();
        this.createGriddle();
        this.createPlate();
        this.createButterPads();
        this.createSyrupBottle();
        this.createBowl();
        
        this.createGraphics();
    },
    createGraphics() {
        this.items.forEach(item => {
            if (item.label === 'counter') return;
            const graphic = Renderer.createGraphics();
            this.drawObstacleGraphics(graphic, item);
            graphic.x = item.position.x;
            graphic.y = item.position.y;
            graphic.rotation = item.angle || 0;
            Renderer.addToLayer('obstacles', graphic, String(item.id));
        });
    },
    drawObstacleGraphics(g, item) {
        switch (item.label) {
            case 'griddle': this.drawGriddleGraphic(g, item); break;
            case 'plate': this.drawPlateGraphic(g, item); break;
            case 'butter': this.drawButterGraphic(g, item); break;
            case 'syrup': this.drawSyrupGraphic(g, item); break;
            case 'bowl': this.drawBowlGraphic(g, item); break;
        }
    },
    drawGriddleGraphic(g, item) {
        const width = item.bounds.max.x - item.bounds.min.x;
        const height = item.bounds.max.y - item.bounds.min.y;
        g.beginFill(CONFIG.colors.griddleHot, 0.10);
        g.drawEllipse(0, 3, width / 2 + 15, 15);
        g.endFill();
        g.beginFill(CONFIG.colors.griddle);
        g.drawRoundedRect(-width / 2, -height / 2, width, height, 4);
        g.endFill();
        g.beginFill(0x666666);
        g.drawRoundedRect(-width / 2 + 3, -height / 2 - 2, width - 6, 5, 2);
        g.endFill();
        g.beginFill(CONFIG.colors.griddleHot, 0.9);
        for (let i = 0; i < 4; i++) {
            g.drawRoundedRect(-30 + i * 20, -height / 2 - 1, 9, 3, 1);
        }
        g.endFill();
        g.beginFill(0xffffff, 0.12);
        g.drawRoundedRect(-width / 2 + 4, height / 2 - 3, width - 8, 2, 1);
        g.endFill();
    },
    drawPlateGraphic(g, item) {
        const width = item.bounds.max.x - item.bounds.min.x;
        g.beginFill(0x000000, 0.16);
        g.drawEllipse(0, 5, width / 2 + 4, 8);
        g.endFill();
        
        const glow = new PIXI.Graphics();
        glow.beginFill(0xffffff, 0.15);
        glow.drawEllipse(0, 0, width / 2 + 20, 20);
        glow.endFill();
        g.addChild(glow);
        this.plateGlow = glow;

        g.beginFill(CONFIG.colors.plate);
        g.drawEllipse(0, 0, width / 2, 11);
        g.endFill();
        g.beginFill(0xf7f7f7);
        g.drawEllipse(0, -1, width / 2 - 8, 8);
        g.endFill();
        g.lineStyle(2, 0xe7d2a5, 0.9);
        g.drawEllipse(0, 0, width / 2 - 4, 9);
        
        g.beginFill(CONFIG.colors.butter, 0.9);
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const x = Math.cos(angle) * (width / 2 - 12);
            const y = Math.sin(angle) * 5;
            g.drawCircle(x, y, 1.8);
        }
        g.endFill();
    },
    drawButterGraphic(g, item) {
        const radius = Math.max(item.bounds.max.x - item.bounds.min.x, item.bounds.max.y - item.bounds.min.y) / 2;
        g.beginFill(CONFIG.colors.butter, 0.18);
        g.drawCircle(0, 0, radius + 8);
        g.endFill();
        g.beginFill(0x000000, 0.1);
        g.drawEllipse(0, radius * 0.55, radius * 0.75, radius * 0.22);
        g.endFill();
        g.beginFill(CONFIG.colors.butter);
        g.drawRoundedRect(-radius * 0.75, -radius * 0.48, radius * 1.5, radius * 0.95, 7);
        g.endFill();
        g.beginFill(CONFIG.colors.butterShadow, 0.7);
        g.drawRoundedRect(-radius * 0.75, radius * 0.15, radius * 1.5, radius * 0.22, 2);
        g.endFill();
        g.beginFill(0xffffff, 0.45);
        g.drawRoundedRect(-radius * 0.48, -radius * 0.36, radius * 0.5, radius * 0.18, 3);
        g.endFill();
        g.beginFill(0xffffff, 0.5);
        g.drawCircle(-radius * 0.42, -radius * 0.22, Math.max(2, radius * 0.12));
        g.endFill();
    },
    drawSyrupGraphic(g, item) {
        const width = item.bounds.max.x - item.bounds.min.x;
        const height = item.bounds.max.y - item.bounds.min.y;
        g.beginFill(0x000000, 0.12);
        g.drawEllipse(0, height / 2 + 3, width / 2 + 3, 5);
        g.endFill();
        g.beginFill(0x7b3f18);
        g.drawRoundedRect(-width / 2, -height / 2, width, height, 5);
        g.endFill();
        g.beginFill(0xa85d2b, 0.75);
        g.drawRoundedRect(-width / 2 + 4, -height / 2 + 4, 5, height - 12, 3);
        g.endFill();
        g.beginFill(0x5f2b0e);
        g.drawRoundedRect(-6, -height / 2 - 9, 12, 11, 2);
        g.endFill();
        g.beginFill(0xc9382f);
        g.drawRoundedRect(-8, -height / 2 - 13, 16, 6, 2);
        g.endFill();
        g.beginFill(0xfff7dc);
        g.drawRoundedRect(-width / 2 + 4, -3, width - 8, 16, 3);
        g.endFill();
        g.beginFill(CONFIG.colors.pancake, 0.9);
        g.drawRect(-width / 2 + 6, 2, width - 12, 4);
        g.endFill();
    },
    drawBowlGraphic(g, item) {
        const width = item.bounds.max.x - item.bounds.min.x;
        const height = item.bounds.max.y - item.bounds.min.y;
        g.beginFill(0x000000, 0.12);
        g.drawEllipse(0, height / 2 + 4, width / 2, 5);
        g.endFill();
        g.beginFill(0x68c984);
        g.drawEllipse(0, 0, width / 2, height / 2);
        g.endFill();
        g.beginFill(0x8de0a0);
        g.drawEllipse(0, -2, width / 2 - 7, height / 2 - 5);
        g.endFill();
        g.beginFill(0xd93d68);
        g.drawCircle(-14, -5, 5);
        g.drawCircle(0, -8, 5);
        g.drawCircle(13, -3, 5);
        g.endFill();
        g.beginFill(0xff9ab5, 0.75);
        g.drawCircle(-15, -6, 1.5);
        g.drawCircle(-1, -9, 1.5);
        g.drawCircle(12, -4, 1.5);
        g.endFill();
    },
    createCounters() {
        const counter = Physics.createBody(CONFIG.canvasWidth / 2, CONFIG.counterY, CONFIG.canvasWidth, 20, {
            isStatic: true, friction: CONFIG.groundFriction, restitution: 0.15, label: 'counter', chamfer: { radius: 5 }
        });
        this.items.push(counter);
        Physics.addBody(counter);
    },
    createGriddle() {
        const griddle = Physics.createBody(CONFIG.startX, CONFIG.counterY - 15, 90, 12, {
            isStatic: true, friction: CONFIG.groundFriction, restitution: 0.15, label: 'griddle', chamfer: { radius: 3 }
        });
        this.items.push(griddle);
        Physics.addBody(griddle);
    },
    createPlate() {
        const plate = Physics.createBody(CONFIG.canvasWidth - 75, CONFIG.counterY - 18, 110, 10, {
            isStatic: true, friction: CONFIG.groundFriction, restitution: 0.05, label: 'plate', chamfer: { radius: 5 }
        });
        this.items.push(plate);
        Physics.addBody(plate);
    },
    createButterPads() {
        const butter1 = Physics.createCircle(CONFIG.canvasWidth / 2, CONFIG.counterY - 70, 28, {
            isStatic: true, restitution: CONFIG.butterRestitution, friction: CONFIG.butterFriction, label: 'butter'
        });
        const butter2 = Physics.createCircle(CONFIG.canvasWidth / 2 + 80, CONFIG.counterY - 140, 22, {
            isStatic: true, restitution: CONFIG.butterRestitution, friction: CONFIG.butterFriction, label: 'butter'
        });
        this.items.push(butter1, butter2);
        Physics.addBody(butter1);
        Physics.addBody(butter2);
    },
    createSyrupBottle() {
        const bottle = Physics.createBody(CONFIG.canvasWidth - 170, CONFIG.counterY - 35, 28, 50, {
            isStatic: true, friction: 0.2, restitution: 0.05, label: 'syrup', chamfer: { radius: 4 }
        });
        this.items.push(bottle);
        Physics.addBody(bottle);
    },
    createBowl() {
        const bowl = Physics.createBody(CONFIG.canvasWidth - 190, CONFIG.counterY - 20, 55, 25, {
            isStatic: true, friction: 0.3, restitution: 0.05, label: 'bowl', chamfer: { radius: 8 }
        });
        this.items.push(bowl);
        Physics.addBody(bowl);
    },
    updateGraphics() {
        this.items.forEach(item => {
            if (!item || !item.position) return;
            const graphic = Renderer.graphics.obstacles.get(String(item.id));
            if (!graphic) return;
            graphic.x = item.position.x;
            graphic.y = item.position.y;
            graphic.rotation = item.angle || 0;
        });
        if (this.plateGlow && this.plateGlow.parent) {
            const time = performance.now() / 1000;
            const pulse = 0.5 + 0.5 * Math.sin(time * 1.5);
            this.plateGlow.alpha = 0.1 + 0.15 * pulse;
            this.plateGlow.scale.set(1 + 0.05 * pulse);
        }
    },
    clear() {
        this.items.forEach(body => {
            if (body && Physics.world) Physics.removeBody(body);
        });
        this.items = [];
        Renderer.clearLayer('obstacles');
        this.plateGlow = null;
    }
};
window.Obstacles = Obstacles;
