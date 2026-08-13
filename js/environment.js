// Environment - Kitchen Scene Rendering
const Environment = {
    graphics: {
        background: null,
        kitchenWall: null,
        window: null,
        counter: null,
        griddle: null,
        plate: null,
        dustContainer: null,
        dustMotes: []
    },

    init() {
        if (!Renderer.layers.environment) {
            console.error('Environment: renderer environment layer is unavailable.');
            return;
        }

        // Completely rebuild the environment.
        Renderer.clearLayer('environment');

        this.graphics = {
            background: null,
            kitchenWall: null,
            window: null,
            counter: null,
            griddle: null,
            plate: null,
            dustContainer: null,
            dustMotes: []
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

        /*
         * Main wall background.
         *
         * Keep this as one large surface so there are no gaps between
         * tiles or transparent areas.
         */
        const gradient = new PIXI.FillGradient(
            0,
            0,
            0,
            CONFIG.counterY
        );

        gradient.addColorStop(0, 0xfffbf5);
        gradient.addColorStop(0.55, 0xf8ead8);
        gradient.addColorStop(1, 0xf0dcc4);

        g.beginFill(gradient);
        g.drawRect(
            0,
            0,
            CONFIG.canvasWidth,
            CONFIG.counterY
        );
        g.endFill();

        Renderer.addToLayer(
            'environment',
            g,
            'background'
        );

        this.graphics.background = g;
    },

    drawKitchenWall() {
        const g = Renderer.createGraphics();

        const tileWidth = 60;
        const tileHeight = 50;

        const rows = Math.ceil(CONFIG.counterY / tileHeight);
        const columns = Math.ceil(CONFIG.canvasWidth / tileWidth);

        /*
         * Subtle tiled backsplash.
         *
         * The tiles intentionally use very low contrast so the pancake
         * remains the visual focus.
         */
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const x = col * tileWidth;
                const y = row * tileHeight;

                const tileColor =
                    (row + col) % 2 === 0
                        ? 0xfff8ee
                        : 0xf7eadb;

                g.beginFill(tileColor);
                g.drawRoundedRect(
                    x + 1,
                    y + 1,
                    tileWidth - 2,
                    tileHeight - 2,
                    3
                );
                g.endFill();
            }
        }

        /*
         * Horizontal and vertical grout lines.
         */
        g.lineStyle(
            1,
            0xd9c7b2,
            0.22
        );

        for (let x = 0; x <= CONFIG.canvasWidth; x += tileWidth) {
            g.moveTo(x, 0);
            g.lineTo(x, CONFIG.counterY);
        }

        for (let y = 0; y <= CONFIG.counterY; y += tileHeight) {
            g.moveTo(0, y);
            g.lineTo(CONFIG.canvasWidth, y);
        }

        Renderer.addToLayer(
            'environment',
            g,
            'kitchenWall'
        );

        this.graphics.kitchenWall = g;
    },

    drawWindow() {
        const g = Renderer.createGraphics();

        const windowW = 118;
        const windowH = 92;

        const windowX =
            CONFIG.canvasWidth / 2 - windowW / 2;

        const windowY = 38;

        /*
         * Outer shadow.
         */
        g.beginFill(0x000000, 0.08);
        g.drawRoundedRect(
            windowX - 9,
            windowY - 6,
            windowW + 18,
            windowH + 18,
            8
        );
        g.endFill();

        /*
         * Wooden frame.
         */
        g.beginFill(0xf7e7d3);
        g.drawRoundedRect(
            windowX - 7,
            windowY - 7,
            windowW + 14,
            windowH + 14,
            7
        );
        g.endFill();

        /*
         * Glass.
         */
        const glassGradient = new PIXI.FillGradient(
            windowX,
            windowY,
            windowX,
            windowY + windowH
        );

        glassGradient.addColorStop(
            0,
            0xb9dcf4
        );

        glassGradient.addColorStop(
            1,
            0xe9f5fc
        );

        g.beginFill(glassGradient);

        g.drawRoundedRect(
            windowX,
            windowY,
            windowW,
            windowH,
            3
        );

        g.endFill();

        /*
         * Simple clouds.
         */
        g.beginFill(0xffffff, 0.45);

        g.drawCircle(
            windowX + 27,
            windowY + 25,
            9
        );

        g.drawCircle(
            windowX + 38,
            windowY + 22,
            12
        );

        g.drawCircle(
            windowX + 50,
            windowY + 26,
            8
        );

        g.endFill();

        /*
         * Window crossbars.
         */
        g.beginFill(0xf7e7d3);

        g.drawRect(
            windowX + windowW / 2 - 3,
            windowY,
            6,
            windowH
        );

        g.drawRect(
            windowX,
            windowY + windowH / 2 - 3,
            windowW,
            6
        );

        g.endFill();

        /*
         * Curtains.
         */
        g.beginFill(0xffb8c6);

        g.moveTo(
            windowX - 9,
            windowY - 8
        );

        g.quadraticCurveTo(
            windowX - 22,
            windowY + windowH * 0.45,
            windowX - 8,
            windowY + windowH + 8
        );

        g.lineTo(
            windowX + 4,
            windowY + windowH + 8
        );

        g.quadraticCurveTo(
            windowX - 1,
            windowY + windowH * 0.45,
            windowX + 4,
            windowY - 8
        );

        g.closePath();
        g.endFill();

        g.beginFill(0xffb8c6);

        g.moveTo(
            windowX + windowW - 4,
            windowY - 8
        );

        g.quadraticCurveTo(
            windowX + windowW + 1,
            windowY + windowH * 0.45,
            windowX + windowW - 8,
            windowY + windowH + 8
        );

        g.lineTo(
            windowX + windowW + 9,
            windowY + windowH + 8
        );

        g.quadraticCurveTo(
            windowX + windowW + 22,
            windowY + windowH * 0.45,
            windowX + windowW + 9,
            windowY - 8
        );

        g.closePath();
        g.endFill();

        Renderer.addToLayer(
            'environment',
            g,
            'window'
        );

        this.graphics.window = g;
    },

    drawCounter() {
        const g = Renderer.createGraphics();

        const counterY = CONFIG.counterY;

        /*
         * Back edge / shadow beneath the countertop.
         */
        g.beginFill(0x704b32, 0.18);

        g.drawRect(
            0,
            counterY - 3,
            CONFIG.canvasWidth,
            16
        );

        g.endFill();

        /*
         * Main countertop.
         */
        g.beginFill(CONFIG.colors.counterTop);

        g.drawRect(
            0,
            counterY - 12,
            CONFIG.canvasWidth,
            18
        );

        g.endFill();

        /*
         * Front face.
         */
        g.beginFill(CONFIG.colors.counter);

        g.drawRect(
            0,
            counterY + 6,
            CONFIG.canvasWidth,
            CONFIG.canvasHeight - counterY - 6
        );

        g.endFill();

        /*
         * Countertop highlight.
         */
        g.beginFill(0xffffff, 0.3);

        g.drawRect(
            0,
            counterY - 12,
            CONFIG.canvasWidth,
            3
        );

        g.endFill();

        /*
         * Front edge.
         */
        g.beginFill(0x8e623f, 0.35);

        g.drawRect(
            0,
            counterY + 6,
            CONFIG.canvasWidth,
            4
        );

        g.endFill();

        /*
         * Wood grain.
         */
        g.lineStyle(
            1,
            0x6d4931,
            0.12
        );

        for (let i = 0; i < 14; i++) {
            const y =
                counterY +
                18 +
                i * 8;

            g.moveTo(
                0,
                y
            );

            g.quadraticCurveTo(
                CONFIG.canvasWidth * 0.25,
                y - 2,
                CONFIG.canvasWidth * 0.5,
                y
            );

            g.quadraticCurveTo(
                CONFIG.canvasWidth * 0.75,
                y + 2,
                CONFIG.canvasWidth,
                y - 1
            );
        }

        Renderer.addToLayer(
            'environment',
            g,
            'counter'
        );

        this.graphics.counter = g;
    },

    drawGriddle() {
        const g = Renderer.createGraphics();

        const griddleX = CONFIG.startX;
        const griddleY = CONFIG.counterY - 15;

        /*
         * Soft shadow.
         */
        g.beginFill(0x000000, 0.2);

        g.drawRoundedRect(
            griddleX - 49,
            griddleY - 5,
            98,
            17,
            5
        );

        g.endFill();

        /*
         * Main griddle.
         */
        g.beginFill(0x3e3e3e);

        g.drawRoundedRect(
            griddleX - 45,
            griddleY - 12,
            90,
            15,
            4
        );

        g.endFill();

        /*
         * Cooking surface.
         */
        g.beginFill(0x5c5c5c);

        g.drawRoundedRect(
            griddleX - 42,
            griddleY - 12,
            84,
            5,
            2
        );

        g.endFill();

        /*
         * Subtle hot glow.
         */
        g.beginFill(0xff5522, 0.08);

        g.drawEllipse(
            griddleX,
            griddleY - 8,
            48,
            13
        );

        g.endFill();

        /*
         * Heating elements.
         */
        g.beginFill(0xff4d2e, 0.85);

        for (let i = 0; i < 4; i++) {
            g.drawRoundedRect(
                griddleX - 34 + i * 20,
                griddleY - 8,
                12,
                3,
                1
            );
        }

        g.endFill();

        /*
         * Small front highlight.
         */
        g.beginFill(0xffffff, 0.1);

        g.drawRect(
            griddleX - 39,
            griddleY - 3,
            78,
            2
        );

        g.endFill();

        Renderer.addToLayer(
            'environment',
            g,
            'griddle'
        );

        this.graphics.griddle = g;
    },

    drawPlate() {
        const g = Renderer.createGraphics();

        const plate = Obstacles.items.find(
            item => item.label === 'plate'
        );

        if (!plate) {
            return;
        }

        const plateX = plate.position.x;
        const plateY = plate.position.y;

        /*
         * Plate shadow.
         */
        g.beginFill(0x000000, 0.18);

        g.drawEllipse(
            plateX,
            plateY + 5,
            55,
            9
        );

        g.endFill();

        /*
         * Outer plate.
         */
        g.beginFill(0xffffff);

        g.drawEllipse(
            plateX,
            plateY - 4,
            56,
            14
        );

        g.endFill();

        /*
         * Plate rim.
         */
        g.lineStyle(
            2,
            0xd9d2ca,
            0.8
        );

        g.drawEllipse(
            plateX,
            plateY - 4,
            48,
            10
        );

        /*
         * Inner plate.
         */
        g.beginFill(0xf8f8f8);

        g.drawEllipse(
            plateX,
            plateY - 5,
            43,
            8
        );

        g.endFill();

        /*
         * Decorative dots.
         */
        g.beginFill(0xffd66b);

        for (let i = 0; i < 8; i++) {
            const angle =
                (i / 8) *
                Math.PI *
                2;

            const dotX =
                plateX +
                Math.cos(angle) * 31;

            const dotY =
                plateY -
                5 +
                Math.sin(angle) * 5;

            g.drawCircle(
                dotX,
                dotY,
                2
            );
        }

        g.endFill();

        Renderer.addToLayer(
            'environment',
            g,
            'plate'
        );

        this.graphics.plate = g;
    },

    createDustMotes() {
        const container = new PIXI.Container();

        container.zIndex = 5;

        Renderer.layers.environment.addChild(
            container
        );

        this.graphics.dustContainer = container;
        this.graphics.dustMotes = [];

        /*
         * Keep dust away from the HUD and main play area.
         */
        for (let i = 0; i < 10; i++) {
            const mote = new PIXI.Graphics();

            const radius =
                1 +
                Math.random() * 1.5;

            mote.beginFill(
                0xffffff,
                0.18 + Math.random() * 0.2
            );

            mote.drawCircle(
                0,
                0,
                radius
            );

            mote.endFill();

            const baseX =
                25 +
                Math.random() *
                (CONFIG.canvasWidth - 50);

            const baseY =
                155 +
                Math.random() *
                360;

            mote.x = baseX;
            mote.y = baseY;

            container.addChild(mote);

            this.graphics.dustMotes.push({
                graphic: mote,
                baseX,
                baseY,
                offset: Math.random() * Math.PI * 2,
                speed: 0.25 + Math.random() * 0.45,
                amplitudeX: 8 + Math.random() * 15,
                amplitudeY: 5 + Math.random() * 10
            });
        }
    },

    update() {
        const time =
            performance.now() / 1000;

        this.graphics.dustMotes.forEach(mote => {
            if (!mote.graphic) {
                return;
            }

            mote.graphic.x =
                mote.baseX +
                Math.sin(
                    time * mote.speed +
                    mote.offset
                ) *
                mote.amplitudeX;

            mote.graphic.y =
                mote.baseY +
                Math.cos(
                    time * mote.speed * 0.7 +
                    mote.offset
                ) *
                mote.amplitudeY;

            /*
             * Very subtle breathing alpha keeps the background
             * feeling alive without distracting from gameplay.
             */
            mote.graphic.alpha =
                0.65 +
                Math.sin(
                    time * mote.speed +
                    mote.offset
                ) *
                0.2;
        });
    }
};

window.Environment = Environment;