// Obstacles - Full with Pixi Graphics
const Obstacles = {
    items: [],
    graphics: new Map(),

    init() {
        this.items = [];
        this.graphics.clear();

        this.createCounters();
        this.createGriddle();
        this.createPlate();
        this.createButterPads();
        this.createSyrupBottle();
        this.createBowl();

        // Create Pixi Graphics for each obstacle
        this.items.forEach(item => {
            const g = new PIXI.Graphics();
            this.drawObstacleGraphics(g, item);
            g.x = item.position.x;
            g.y = item.position.y;
            g.rotation = item.angle || 0;
            Renderer.layers.obstacles.addChild(g);
            this.graphics.set(item.id, g);
        });
    },

    drawObstacleGraphics(g, item) {
        if (item.label === 'butter') {
            // Glow (simulated with translucent circles)
            g.beginFill(0xffe066, 0.3);
            g.drawCircle(0, 0, 35);
            g.endFill();
            // Body
            g.beginFill(CONFIG.colors.butter);
            g.drawCircle(0, 0, 28);
            g.endFill();
            // Shine
            g.beginFill(0xffffff, 0.6);
            g.drawCircle(-9, -9, 8);
            g.endFill();
        } else if (item.label === 'syrup') {
            // Bottle body
            g.beginFill(CONFIG.colors.syrup);
            g.drawRect(-14, -25, 28, 50);
            g.endFill();
            // Neck
            g.beginFill(CONFIG.colors.syrupDark);
            g.drawRect(-6, -35, 12, 10);
            g.endFill();
            // Cap
            g.beginFill(0xcc0000);
            g.drawRect(-8, -40, 16, 8);
            g.endFill();
            // Label
            g.beginFill(0xffffff);
            g.drawRect(-10, -5, 20, 15);
            g.endFill();
            // Label text (we'll skip actual text for now)
        } else if (item.label === 'bowl') {
            // Bowl body
            g.beginFill(0x6bcf7f);
            g.drawEllipse(0, 0, 55, 25);
            g.endFill();
            // Berries
            g.beginFill(0xff3366);
            g.drawCircle(-10, -5, 5);
            g.drawCircle(10, -3, 4);
            g.drawCircle(0, -8, 4);
            g.endFill();
        }
    },

    createCounters() {
        const sections = [
            { x: 130, width: 160 },
            { x: CONFIG.canvasWidth - 120, width: 160 }
        ];
        sections.forEach(section => {
            const counter = Physics.createBody(
                section.x, CONFIG.counterY, section.width, 20,
                { isStatic: true, friction: 0.6, restitution: 0.15, label: 'counter', chamfer: { radius: 5 } }
            );
            this.items.push(counter);
            Physics.addBody(counter);
        });
    },

    createGriddle() {
        const griddle = Physics.createBody(
            CONFIG.startX, CONFIG.counterY - 15, 90, 12,
            { isStatic: true, friction: 0.4, restitution: 0.25, label: 'griddle', chamfer: { radius: 3 } }
        );
        this.items.push(griddle);
        Physics.addBody(griddle);
    },

    createPlate() {
        const plate = Physics.createBody(
            CONFIG.canvasWidth - 75, CONFIG.counterY - 18, 110, 10,
            { isStatic: true, friction: 0.5, restitution: 0.1, label: 'plate', chamfer: { radius: 5 } }
        );
        this.items.push(plate);
        Physics.addBody(plate);
    },

    createButterPads() {
        const butter1 = Physics.createCircle(
            CONFIG.canvasWidth / 2, CONFIG.counterY - 70, 28,
            { isStatic: true, restitution: CONFIG.butterRestitution, friction: CONFIG.butterFriction, label: 'butter' }
        );
        const butter2 = Physics.createCircle(
            CONFIG.canvasWidth / 2 + 80, CONFIG.counterY - 140, 22,
            { isStatic: true, restitution: CONFIG.butterRestitution, friction: CONFIG.butterFriction, label: 'butter' }
        );
        this.items.push(butter1, butter2);
        Physics.addBody(butter1);
        Physics.addBody(butter2);
    },

    createSyrupBottle() {
        const bottle = Physics.createBody(
            CONFIG.canvasWidth - 170, CONFIG.counterY - 35, 28, 50,
            { isStatic: true, friction: 0.2, label: 'syrup', chamfer: { radius: 4 } }
        );
        this.items.push(bottle);
        Physics.addBody(bottle);
    },

    createBowl() {
        const bowl = Physics.createBody(
            CONFIG.canvasWidth - 190, CONFIG.counterY - 20, 55, 25,
            { isStatic: true, friction: 0.3, label: 'bowl', chamfer: { radius: 8 } }
        );
        this.items.push(bowl);
        Physics.addBody(bowl);
    },

    updateGraphics() {
        this.items.forEach(item => {
            const g = this.graphics.get(item.id);
            if (g && item.position) {
                g.x = item.position.x;
                g.y = item.position.y;
                g.rotation = item.angle || 0;
            }
        });
    }
};

window.Obstacles = Obstacles;