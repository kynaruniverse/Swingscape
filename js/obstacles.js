// Obstacles - Physics Bodies + PixiJS Graphics
const Obstacles = {
    items: [],
    graphics: new Map(),

    init() {
        // Remove any old obstacle physics bodies from the world.
        if (this.items.length > 0 && Physics.world) {
            this.items.forEach(item => {
                Physics.removeBody(item);
            });
        }

        // Remove old obstacle graphics.
        if (Renderer.layers.obstacles) {
            Renderer.layers.obstacles.removeChildren();
        }

        this.items = [];
        this.graphics.clear();

        // Create physics objects.
        this.createCounters();
        this.createGriddle();
        this.createPlate();
        this.createButterPads();
        this.createSyrupBottle();
        this.createBowl();

        // Create matching Pixi graphics.
        this.items.forEach(item => {
            const graphic = new PIXI.Graphics();

            this.drawObstacleGraphics(graphic, item);

            graphic.x = item.position.x;
            graphic.y = item.position.y;
            graphic.rotation = item.angle || 0;

            Renderer.layers.obstacles.addChild(graphic);
            this.graphics.set(item.id, graphic);
        });
    },

    drawObstacleGraphics(g, item) {
        switch (item.label) {
            case 'counter':
                this.drawCounterGraphic(g, item);
                break;

            case 'griddle':
                this.drawGriddleGraphic(g, item);
                break;

            case 'plate':
                this.drawPlateGraphic(g, item);
                break;

            case 'butter':
                this.drawButterGraphic(g, item);
                break;

            case 'syrup':
                this.drawSyrupGraphic(g, item);
                break;

            case 'bowl':
                this.drawBowlGraphic(g, item);
                break;
        }
    },

    drawCounterGraphic(g, item) {
        const width = item.bounds.max.x - item.bounds.min.x;
        const height = item.bounds.max.y - item.bounds.min.y;

        // Main counter.
        g.beginFill(0xc4956a);
        g.drawRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            5
        );
        g.endFill();

        // Top surface highlight.
        g.beginFill(0xd4a574);
        g.drawRoundedRect(
            -width / 2,
            -height / 2,
            width,
            5,
            3
        );
        g.endFill();

        // Subtle wood grain.
        g.lineStyle(1, 0x8f653f, 0.18);

        for (let y = -height / 2 + 7; y < height / 2; y += 6) {
            g.moveTo(-width / 2 + 5, y);
            g.lineTo(width / 2 - 5, y);
        }

        g.endFill();
    },

    drawGriddleGraphic(g, item) {
        const width = item.bounds.max.x - item.bounds.min.x;
        const height = item.bounds.max.y - item.bounds.min.y;

        // Soft glow behind the hot griddle.
        g.beginFill(0xff5522, 0.12);
        g.drawEllipse(0, 2, width / 2 + 15, 15);
        g.endFill();

        // Griddle body.
        g.beginFill(0x444444);
        g.drawRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            4
        );
        g.endFill();

        // Hot cooking surface.
        g.beginFill(0x666666);
        g.drawRoundedRect(
            -width / 2 + 3,
            -height / 2 - 2,
            width - 6,
            5,
            2
        );
        g.endFill();

        // Heating elements.
        g.beginFill(0xff4a24, 0.9);

        for (let i = 0; i < 4; i++) {
            const elementWidth = 9;
            const spacing = 20;

            g.drawRoundedRect(
                -30 + i * spacing,
                -height / 2 - 1,
                elementWidth,
                3,
                1
            );
        }

        g.endFill();

        // Small shine on the front edge.
        g.beginFill(0xffffff, 0.12);
        g.drawRoundedRect(
            -width / 2 + 4,
            height / 2 - 3,
            width - 8,
            2,
            1
        );
        g.endFill();
    },

    drawPlateGraphic(g, item) {
        const width = item.bounds.max.x - item.bounds.min.x;

        // Shadow.
        g.beginFill(0x000000, 0.16);
        g.drawEllipse(0, 5, width / 2 + 4, 8);
        g.endFill();

        // Plate outer edge.
        g.beginFill(0xffffff);
        g.drawEllipse(0, 0, width / 2, 11);
        g.endFill();

        // Plate inner surface.
        g.beginFill(0xf7f7f7);
        g.drawEllipse(0, -1, width / 2 - 8, 8);
        g.endFill();

        // Decorative rim.
        g.lineStyle(2, 0xe7d2a5, 0.9);
        g.drawEllipse(0, 0, width / 2 - 4, 9);

        // Decorative dots.
        g.beginFill(0xffd45c, 0.9);

        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;

            const x = Math.cos(angle) * (width / 2 - 12);
            const y = Math.sin(angle) * 5;

            g.drawCircle(x, y, 1.8);
        }

        g.endFill();
    },

    drawButterGraphic(g, item) {
        const radius =
            Math.max(
                item.bounds.max.x - item.bounds.min.x,
                item.bounds.max.y - item.bounds.min.y
            ) / 2;

        // Glow.
        g.beginFill(0xffe066, 0.18);
        g.drawCircle(0, 0, radius + 8);
        g.endFill();

        // Shadow.
        g.beginFill(0x000000, 0.1);
        g.drawEllipse(0, radius * 0.55, radius * 0.75, radius * 0.22);
        g.endFill();

        // Butter.
        g.beginFill(0xffdf55);
        g.drawRoundedRect(
            -radius * 0.75,
            -radius * 0.48,
            radius * 1.5,
            radius * 0.95,
            7
        );
        g.endFill();

        // Butter highlight.
        g.beginFill(0xfff3a8, 0.75);
        g.drawRoundedRect(
            -radius * 0.48,
            -radius * 0.36,
            radius * 0.5,
            radius * 0.18,
            3
        );
        g.endFill();

        // Small shine.
        g.beginFill(0xffffff, 0.5);
        g.drawCircle(
            -radius * 0.42,
            -radius * 0.22,
            Math.max(2, radius * 0.12)
        );
        g.endFill();
    },

    drawSyrupGraphic(g, item) {
        const width = item.bounds.max.x - item.bounds.min.x;
        const height = item.bounds.max.y - item.bounds.min.y;

        // Shadow.
        g.beginFill(0x000000, 0.12);
        g.drawEllipse(0, height / 2 + 3, width / 2 + 3, 5);
        g.endFill();

        // Bottle.
        g.beginFill(0x7b3f18);
        g.drawRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            5
        );
        g.endFill();

        // Bottle highlight.
        g.beginFill(0xa85d2b, 0.75);
        g.drawRoundedRect(
            -width / 2 + 4,
            -height / 2 + 4,
            5,
            height - 12,
            3
        );
        g.endFill();

        // Neck.
        g.beginFill(0x5f2b0e);
        g.drawRoundedRect(
            -6,
            -height / 2 - 9,
            12,
            11,
            2
        );
        g.endFill();

        // Cap.
        g.beginFill(0xc9382f);
        g.drawRoundedRect(
            -8,
            -height / 2 - 13,
            16,
            6,
            2
        );
        g.endFill();

        // Label.
        g.beginFill(0xfff7dc);
        g.drawRoundedRect(
            -width / 2 + 4,
            -3,
            width - 8,
            16,
            3
        );
        g.endFill();

        // Label stripe.
        g.beginFill(0xe8a860);
        g.drawRect(
            -width / 2 + 6,
            2,
            width - 12,
            4
        );
        g.endFill();
    },

    drawBowlGraphic(g, item) {
        const width = item.bounds.max.x - item.bounds.min.x;
        const height = item.bounds.max.y - item.bounds.min.y;

        // Shadow.
        g.beginFill(0x000000, 0.12);
        g.drawEllipse(0, height / 2 + 4, width / 2, 5);
        g.endFill();

        // Bowl.
        g.beginFill(0x68c984);
        g.drawEllipse(
            0,
            0,
            width / 2,
            height / 2
        );
        g.endFill();

        // Bowl inner.
        g.beginFill(0x8de0a0);
        g.drawEllipse(
            0,
            -2,
            width / 2 - 7,
            height / 2 - 5
        );
        g.endFill();

        // Berries.
        g.beginFill(0xd93d68);
        g.drawCircle(-14, -5, 5);
        g.drawCircle(0, -8, 5);
        g.drawCircle(13, -3, 5);
        g.endFill();

        // Berry highlights.
        g.beginFill(0xff9ab5, 0.75);
        g.drawCircle(-15, -6, 1.5);
        g.drawCircle(-1, -9, 1.5);
        g.drawCircle(12, -4, 1.5);
        g.endFill();
    },

    createCounters() {
        const sections = [
            {
                x: 130,
                width: 160
            },
            {
                x: CONFIG.canvasWidth - 120,
                width: 160
            }
        ];

        sections.forEach(section => {
            const counter = Physics.createBody(
                section.x,
                CONFIG.counterY,
                section.width,
                20,
                {
                    isStatic: true,
                    friction: 0.6,
                    restitution: 0.15,
                    label: 'counter',
                    chamfer: {
                        radius: 5
                    }
                }
            );

            this.items.push(counter);
            Physics.addBody(counter);
        });
    },

    createGriddle() {
        const griddle = Physics.createBody(
            CONFIG.startX,
            CONFIG.counterY - 15,
            90,
            12,
            {
                isStatic: true,
                friction: 0.4,
                restitution: 0.15,
                label: 'griddle',
                chamfer: {
                    radius: 3
                }
            }
        );

        this.items.push(griddle);
        Physics.addBody(griddle);
    },

    createPlate() {
        const plate = Physics.createBody(
            CONFIG.canvasWidth - 75,
            CONFIG.counterY - 18,
            110,
            10,
            {
                isStatic: true,
                friction: 0.5,
                restitution: 0.05,
                label: 'plate',
                chamfer: {
                    radius: 5
                }
            }
        );

        this.items.push(plate);
        Physics.addBody(plate);
    },

    createButterPads() {
        const butter1 = Physics.createCircle(
            CONFIG.canvasWidth / 2,
            CONFIG.counterY - 70,
            28,
            {
                isStatic: true,
                restitution: CONFIG.butterRestitution,
                friction: CONFIG.butterFriction,
                label: 'butter'
            }
        );

        const butter2 = Physics.createCircle(
            CONFIG.canvasWidth / 2 + 80,
            CONFIG.counterY - 140,
            22,
            {
                isStatic: true,
                restitution: CONFIG.butterRestitution,
                friction: CONFIG.butterFriction,
                label: 'butter'
            }
        );

        this.items.push(butter1, butter2);

        Physics.addBody(butter1);
        Physics.addBody(butter2);
    },

    createSyrupBottle() {
        const bottle = Physics.createBody(
            CONFIG.canvasWidth - 170,
            CONFIG.counterY - 35,
            28,
            50,
            {
                isStatic: true,
                friction: 0.2,
                restitution: 0.05,
                label: 'syrup',
                chamfer: {
                    radius: 4
                }
            }
        );

        this.items.push(bottle);
        Physics.addBody(bottle);
    },

    createBowl() {
        const bowl = Physics.createBody(
            CONFIG.canvasWidth - 190,
            CONFIG.counterY - 20,
            55,
            25,
            {
                isStatic: true,
                friction: 0.3,
                restitution: 0.05,
                label: 'bowl',
                chamfer: {
                    radius: 8
                }
            }
        );

        this.items.push(bowl);
        Physics.addBody(bowl);
    },

    updateGraphics() {
        this.items.forEach(item => {
            const graphic = this.graphics.get(item.id);

            if (!graphic || !item.position) {
                return;
            }

            graphic.x = item.position.x;
            graphic.y = item.position.y;
            graphic.rotation = item.angle || 0;
        });
    }
};

window.Obstacles = Obstacles;