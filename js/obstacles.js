// ============================================================
// PANCAKE PLOP! — OBSTACLES
// Matter.js physics bodies + PixiJS visuals
// ============================================================

const Obstacles = {

    items: [],

    // --------------------------------------------------------
    // INITIALISE
    // --------------------------------------------------------

    init() {

        /*
         * Remove any previous obstacle physics bodies.
         */

        if (this.items.length > 0 && Physics.world) {

            this.items.forEach(body => {

                if (body) {
                    Physics.removeBody(body);
                }

            });
        }

        this.items = [];

        /*
         * Renderer owns the obstacle graphics.
         */

        Renderer.clearLayer('obstacles');

        /*
         * Build the level geometry.
         */

        this.createCounters();
        this.createGriddle();
        this.createPlate();
        this.createButterPads();
        this.createSyrupBottle();
        this.createBowl();

        /*
         * Create the corresponding visuals.
         */

        this.createGraphics();

        console.log(
            'Obstacles initialized:',
            this.items.length
        );
    },

    // --------------------------------------------------------
    // GRAPHICS
    // --------------------------------------------------------

    createGraphics() {

        this.items.forEach(item => {

            /*
             * The counter visual belongs to Environment.
             *
             * Obstacles only renders gameplay-object visuals:
             * griddle, plate, butter, syrup, bowl.
             */
            if (item.label === 'counter') {
                return;
            }

            const graphic =
                Renderer.createGraphics();

            this.drawObstacleGraphics(
                graphic,
                item
            );

            graphic.x =
                item.position.x;

            graphic.y =
                item.position.y;

            graphic.rotation =
                item.angle || 0;

            Renderer.addToLayer(
                'obstacles',
                graphic,
                String(item.id)
            );
        });
    },

    drawObstacleGraphics(g, item) {

        switch (item.label) {

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

    // --------------------------------------------------------
    // GRIDDLE GRAPHIC
    // --------------------------------------------------------

    drawGriddleGraphic(g, item) {

        const width =
            item.bounds.max.x -
            item.bounds.min.x;

        const height =
            item.bounds.max.y -
            item.bounds.min.y;

        /*
         * Heat glow.
         */

        g.beginFill(
            CONFIG.colors.griddleHot,
            0.10
        );

        g.drawEllipse(
            0,
            3,
            width / 2 + 15,
            15
        );

        g.endFill();

        /*
         * Main griddle body.
         */

        g.beginFill(
            CONFIG.colors.griddle
        );

        g.drawRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            4
        );

        g.endFill();

        /*
         * Cooking surface.
         */

        g.beginFill(
            0x666666
        );

        g.drawRoundedRect(
            -width / 2 + 3,
            -height / 2 - 2,
            width - 6,
            5,
            2
        );

        g.endFill();

        /*
         * Heating elements.
         */

        g.beginFill(
            CONFIG.colors.griddleHot,
            0.9
        );

        for (let i = 0; i < 4; i++) {

            g.drawRoundedRect(
                -30 + i * 20,
                -height / 2 - 1,
                9,
                3,
                1
            );
        }

        g.endFill();

        /*
         * Front highlight.
         */

        g.beginFill(
            0xffffff,
            0.12
        );

        g.drawRoundedRect(
            -width / 2 + 4,
            height / 2 - 3,
            width - 8,
            2,
            1
        );

        g.endFill();
    },

    // --------------------------------------------------------
    // PLATE GRAPHIC
    // --------------------------------------------------------

    drawPlateGraphic(g, item) {

        const width =
            item.bounds.max.x -
            item.bounds.min.x;

        /*
         * Shadow.
         */

        g.beginFill(
            0x000000,
            0.16
        );

        g.drawEllipse(
            0,
            5,
            width / 2 + 4,
            8
        );

        g.endFill();

        /*
         * Plate.
         */

        g.beginFill(
            CONFIG.colors.plate
        );

        g.drawEllipse(
            0,
            0,
            width / 2,
            11
        );

        g.endFill();

        /*
         * Inner plate.
         */

        g.beginFill(
            0xf7f7f7
        );

        g.drawEllipse(
            0,
            -1,
            width / 2 - 8,
            8
        );

        g.endFill();

        /*
         * Decorative rim.
         */

        g.lineStyle(
            2,
            0xe7d2a5,
            0.9
        );

        g.drawEllipse(
            0,
            0,
            width / 2 - 4,
            9
        );

        /*
         * Decorative dots.
         */

        g.beginFill(
            CONFIG.colors.butter,
            0.9
        );

        for (let i = 0; i < 8; i++) {

            const angle =
                (Math.PI * 2 * i) / 8;

            const x =
                Math.cos(angle) *
                (width / 2 - 12);

            const y =
                Math.sin(angle) * 5;

            g.drawCircle(
                x,
                y,
                1.8
            );
        }

        g.endFill();
    },

    // --------------------------------------------------------
    // BUTTER GRAPHIC
    // --------------------------------------------------------

    drawButterGraphic(g, item) {

        const radius =
            Math.max(
                item.bounds.max.x -
                    item.bounds.min.x,

                item.bounds.max.y -
                    item.bounds.min.y
            ) / 2;

        /*
         * Soft glow.
         */

        g.beginFill(
            CONFIG.colors.butter,
            0.18
        );

        g.drawCircle(
            0,
            0,
            radius + 8
        );

        g.endFill();

        /*
         * Shadow.
         */

        g.beginFill(
            0x000000,
            0.1
        );

        g.drawEllipse(
            0,
            radius * 0.55,
            radius * 0.75,
            radius * 0.22
        );

        g.endFill();

        /*
         * Butter.
         */

        g.beginFill(
            CONFIG.colors.butter
        );

        g.drawRoundedRect(
            -radius * 0.75,
            -radius * 0.48,
            radius * 1.5,
            radius * 0.95,
            7
        );

        g.endFill();

        /*
         * Lower butter edge.
         */

        g.beginFill(
            CONFIG.colors.butterShadow,
            0.7
        );

        g.drawRoundedRect(
            -radius * 0.75,
            radius * 0.15,
            radius * 1.5,
            radius * 0.22,
            2
        );

        g.endFill();

        /*
         * Highlight.
         */

        g.beginFill(
            0xffffff,
            0.45
        );

        g.drawRoundedRect(
            -radius * 0.48,
            -radius * 0.36,
            radius * 0.5,
            radius * 0.18,
            3
        );

        g.endFill();

        g.beginFill(
            0xffffff,
            0.5
        );

        g.drawCircle(
            -radius * 0.42,
            -radius * 0.22,
            Math.max(
                2,
                radius * 0.12
            )
        );

        g.endFill();
    },

    // --------------------------------------------------------
    // SYRUP GRAPHIC
    // --------------------------------------------------------

    drawSyrupGraphic(g, item) {

        const width =
            item.bounds.max.x -
            item.bounds.min.x;

        const height =
            item.bounds.max.y -
            item.bounds.min.y;

        /*
         * Shadow.
         */

        g.beginFill(
            0x000000,
            0.12
        );

        g.drawEllipse(
            0,
            height / 2 + 3,
            width / 2 + 3,
            5
        );

        g.endFill();

        /*
         * Bottle.
         */

        g.beginFill(
            0x7b3f18
        );

        g.drawRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            5
        );

        g.endFill();

        /*
         * Bottle highlight.
         */

        g.beginFill(
            0xa85d2b,
            0.75
        );

        g.drawRoundedRect(
            -width / 2 + 4,
            -height / 2 + 4,
            5,
            height - 12,
            3
        );

        g.endFill();

        /*
         * Neck.
         */

        g.beginFill(
            0x5f2b0e
        );

        g.drawRoundedRect(
            -6,
            -height / 2 - 9,
            12,
            11,
            2
        );

        g.endFill();

        /*
         * Cap.
         */

        g.beginFill(
            0xc9382f
        );

        g.drawRoundedRect(
            -8,
            -height / 2 - 13,
            16,
            6,
            2
        );

        g.endFill();

        /*
         * Label.
         */

        g.beginFill(
            0xfff7dc
        );

        g.drawRoundedRect(
            -width / 2 + 4,
            -3,
            width - 8,
            16,
            3
        );

        g.endFill();

        /*
         * Label stripe.
         */

        g.beginFill(
            CONFIG.colors.pancake,
            0.9
        );

        g.drawRect(
            -width / 2 + 6,
            2,
            width - 12,
            4
        );

        g.endFill();
    },

    // --------------------------------------------------------
    // BOWL GRAPHIC
    // --------------------------------------------------------

    drawBowlGraphic(g, item) {

        const width =
            item.bounds.max.x -
            item.bounds.min.x;

        const height =
            item.bounds.max.y -
            item.bounds.min.y;

        /*
         * Shadow.
         */

        g.beginFill(
            0x000000,
            0.12
        );

        g.drawEllipse(
            0,
            height / 2 + 4,
            width / 2,
            5
        );

        g.endFill();

        /*
         * Bowl.
         */

        g.beginFill(
            0x68c984
        );

        g.drawEllipse(
            0,
            0,
            width / 2,
            height / 2
        );

        g.endFill();

        /*
         * Bowl interior.
         */

        g.beginFill(
            0x8de0a0
        );

        g.drawEllipse(
            0,
            -2,
            width / 2 - 7,
            height / 2 - 5
        );

        g.endFill();

        /*
         * Berries.
         */

        g.beginFill(
            0xd93d68
        );

        g.drawCircle(-14, -5, 5);
        g.drawCircle(0, -8, 5);
        g.drawCircle(13, -3, 5);

        g.endFill();

        /*
         * Berry highlights.
         */

        g.beginFill(
            0xff9ab5,
            0.75
        );

        g.drawCircle(-15, -6, 1.5);
        g.drawCircle(-1, -9, 1.5);
        g.drawCircle(12, -4, 1.5);

        g.endFill();
    },

    // --------------------------------------------------------
    // PHYSICS — COUNTERS
    // --------------------------------------------------------

    createCounters() {

        /*
         * One continuous countertop.
         *
         * This gives the kitchen a consistent physical floor
         * while the individual objects above it create the
         * gameplay obstacles.
         */

        const counter =
            Physics.createBody(
                CONFIG.canvasWidth / 2,
                CONFIG.counterY,
                CONFIG.canvasWidth,
                20,
                {
                    isStatic: true,

                    friction:
                        CONFIG.groundFriction,

                    restitution: 0.15,

                    label: 'counter',

                    chamfer: {
                        radius: 5
                    }
                }
            );

        this.items.push(counter);

        Physics.addBody(counter);
    },

    // --------------------------------------------------------
    // PHYSICS — GRIDDLE
    // --------------------------------------------------------

    createGriddle() {

        const griddle =
            Physics.createBody(
                CONFIG.startX,
                CONFIG.counterY - 15,
                90,
                12,
                {
                    isStatic: true,

                    friction:
                        CONFIG.groundFriction,

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

    // --------------------------------------------------------
    // PHYSICS — PLATE
    // --------------------------------------------------------

    createPlate() {

        const plate =
            Physics.createBody(
                CONFIG.canvasWidth - 75,
                CONFIG.counterY - 18,
                110,
                10,
                {
                    isStatic: true,

                    friction:
                        CONFIG.groundFriction,

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

    // --------------------------------------------------------
    // PHYSICS — BUTTER
    // --------------------------------------------------------

    createButterPads() {

        const butter1 =
            Physics.createCircle(
                CONFIG.canvasWidth / 2,
                CONFIG.counterY - 70,
                28,
                {
                    isStatic: true,

                    restitution:
                        CONFIG.butterRestitution,

                    friction:
                        CONFIG.butterFriction,

                    label: 'butter'
                }
            );

        const butter2 =
            Physics.createCircle(
                CONFIG.canvasWidth / 2 + 80,
                CONFIG.counterY - 140,
                22,
                {
                    isStatic: true,

                    restitution:
                        CONFIG.butterRestitution,

                    friction:
                        CONFIG.butterFriction,

                    label: 'butter'
                }
            );

        this.items.push(
            butter1,
            butter2
        );

        Physics.addBody(
            butter1
        );

        Physics.addBody(
            butter2
        );
    },

    // --------------------------------------------------------
    // PHYSICS — SYRUP
    // --------------------------------------------------------

    createSyrupBottle() {

        const bottle =
            Physics.createBody(
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

        this.items.push(
            bottle
        );

        Physics.addBody(
            bottle
        );
    },

    // --------------------------------------------------------
    // PHYSICS — BOWL
    // --------------------------------------------------------

    createBowl() {

        const bowl =
            Physics.createBody(
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

        this.items.push(
            bowl
        );

        Physics.addBody(
            bowl
        );
    },

    // --------------------------------------------------------
    // UPDATE
    // --------------------------------------------------------

    updateGraphics() {

        this.items.forEach(item => {

            if (!item || !item.position) {
                return;
            }

            const graphic =
                Renderer.graphics.obstacles.get(
                    String(item.id)
                );

            if (!graphic) {
                return;
            }

            graphic.x =
                item.position.x;

            graphic.y =
                item.position.y;

            graphic.rotation =
                item.angle || 0;
        });
    },

    // --------------------------------------------------------
    // RESET
    // --------------------------------------------------------

    clear() {

        this.items.forEach(body => {

            if (body && Physics.world) {
                Physics.removeBody(body);
            }

        });

        this.items = [];

        Renderer.clearLayer(
            'obstacles'
        );
    }
};

window.Obstacles = Obstacles;