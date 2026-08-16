// ============================================================
// PANCAKE PLOP! — KITCHEN ENVIRONMENT
// Visual-only kitchen scene
// ============================================================
//
// Environment owns:
//
// • Background
// • Walls / backsplash
// • Window
// • Decorative kitchen details
// • Counter presentation
// • Ambient dust
// • Steam above griddle
//
// IMPORTANT:
//
// Environment does NOT own gameplay physics.
//
// Counters, griddles, plates, butter, syrup and bowls are
// created and positioned by Obstacles.
//
// This keeps physics and rendering responsibilities separate.
// ============================================================

const Environment = {

    // --------------------------------------------------------
    // GRAPHICS
    // --------------------------------------------------------

    graphics: {

        background: null,

        kitchenWall: null,

        window: null,

        shelfProps: null,

        counter: null,

        dustContainer: null,

        dustMotes: []
    },

    // Steam particles
    steamParticles: [],

    // --------------------------------------------------------
    // INITIALISE
    // --------------------------------------------------------

    init() {

        if (
            !Renderer ||
            !Renderer.layers.environment
        ) {

            console.error(
                'Environment: renderer environment layer unavailable.'
            );

            return;
        }

        /*
         * Completely rebuild the environment.
         */

        Renderer.clearLayer(
            'environment'
        );

        this.graphics = {

            background: null,

            kitchenWall: null,

            window: null,

            shelfProps: null,

            counter: null,

            dustContainer: null,

            dustMotes: []
        };

        this.steamParticles = [];

        this.drawBackground();

        this.drawKitchenWall();

        this.drawWindow();

        this.drawShelfProps();

        this.drawCounter();

        this.createDustMotes();

        this.createSteam();

        console.log(
            'Environment initialized.'
        );
    },

    // ========================================================
    // BACKGROUND
    // ========================================================

    drawBackground() {

        const g =
            Renderer.createGraphics();

        const width =
            CONFIG.canvasWidth;

        const height =
            CONFIG.obstacles.counter.y;

        /*
         * A real gradient (audit finding: the previous comment
         * here said "no gradient because PixiJS v7 does not have
         * PIXI.FillGradient" — true for that specific v8 API,
         * but v7 can still do a real gradient via a canvas-
         * generated texture; see js/textures.js). This is the
         * lower-risk target flagged when that utility was built:
         * a static, non-rotating, full-panel rect with the
         * texture generated at exactly this rect's size, so the
         * fill maps 1:1 with no tiling/matrix math needed.
         *
         * CONFIG.colors.backgroundDark existed in config but was
         * never actually used anywhere until now — this is what
         * it was for.
         */

        const texture =
            Textures.linearGradient({
                width,
                height,
                topColor: CONFIG.colors.background,
                bottomColor: CONFIG.colors.backgroundDark
            });

        g.beginTextureFill({
            texture
        });

        g.drawRect(
            0,
            0,
            width,
            height
        );

        g.endFill();

        Renderer.addToLayer(
            'environment',
            g,
            'background'
        );

        this.graphics.background =
            g;
    },

    // ========================================================
    // KITCHEN WALL
    // ========================================================

    drawKitchenWall() {

        const g =
            Renderer.createGraphics();

        const tileWidth =
            60;

        const tileHeight =
            50;

        const rows =
            Math.ceil(
                CONFIG.obstacles.counter.y /
                tileHeight
            );

        const columns =
            Math.ceil(
                CONFIG.canvasWidth /
                tileWidth
            );

        /*
         * Subtle checker variation.
         */

        for (
            let row = 0;
            row < rows;
            row++
        ) {

            for (
                let col = 0;
                col < columns;
                col++
            ) {

                const x =
                    col *
                    tileWidth;

                const y =
                    row *
                    tileHeight;

                const tileColor =
                    (row + col) % 2 === 0
                        ? CONFIG.colors.wallTile
                        : CONFIG.colors.wall;

                g.beginFill(
                    tileColor
                );

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
         * Grout.
         */

        g.lineStyle(
            1,
            0xcdbba6,
            0.20
        );

        for (
            let x = 0;
            x <= CONFIG.canvasWidth;
            x += tileWidth
        ) {

            g.moveTo(
                x,
                0
            );

            g.lineTo(
                x,
                CONFIG.obstacles.counter.y
            );
        }

        for (
            let y = 0;
            y <= CONFIG.obstacles.counter.y;
            y += tileHeight
        ) {

            g.moveTo(
                0,
                y
            );

            g.lineTo(
                CONFIG.canvasWidth,
                y
            );
        }

        Renderer.addToLayer(
            'environment',
            g,
            'kitchenWall'
        );

        this.graphics.kitchenWall =
            g;
    },

    // ========================================================
    // WINDOW
    // ========================================================

    drawWindow() {

        const g =
            Renderer.createGraphics();

        const windowWidth =
            118;

        const windowHeight =
            92;

        const windowX =
            (
                CONFIG.canvasWidth -
                windowWidth
            ) / 2;

        const windowY =
            38;

        /*
         * Shadow.
         */

        g.beginFill(
            0x000000,
            0.08
        );

        g.drawRoundedRect(
            windowX - 9,
            windowY - 6,
            windowWidth + 18,
            windowHeight + 18,
            8
        );

        g.endFill();

        /*
         * Frame.
         */

        g.beginFill(
            CONFIG.colors.windowFrame
        );

        g.drawRoundedRect(
            windowX - 7,
            windowY - 7,
            windowWidth + 14,
            windowHeight + 14,
            7
        );

        g.endFill();

        /*
         * Glass.
         *
         * Solid colour instead of gradient.
         *
         * (A texture-fill gradient was tried here during the
         * Art Bible pass — same technique as drawBackground()
         * below — but this rect isn't drawn at local (0,0), so
         * it needs a translation matrix to align the texture
         * with the rect's actual position. Whether PIXI.Matrix
         * for a Graphics texture fill maps local-space→texture-
         * space or the reverse isn't something I could verify
         * with confidence without a browser to actually render
         * it in, and getting the direction wrong would show a
         * shifted/wrong slice of the gradient — a visible
         * regression on something that currently works. Left as
         * a solid fill rather than ship an unverified guess;
         * drawBackground()'s gradient is the confidently-correct
         * version of this technique, since it fills a rect at
         * local (0,0) where there's no directional ambiguity.)
         */

        g.beginFill(
            0xcfe8f8
        );

        g.drawRoundedRect(
            windowX,
            windowY,
            windowWidth,
            windowHeight,
            3
        );

        g.endFill();

        /*
         * Clouds.
         */

        g.beginFill(
            0xffffff,
            0.45
        );

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
         * Window frame crossbars.
         */

        g.beginFill(
            CONFIG.colors.windowFrame
        );

        g.drawRect(
            windowX +
                windowWidth / 2 -
                3,
            windowY,
            6,
            windowHeight
        );

        g.drawRect(
            windowX,
            windowY +
                windowHeight / 2 -
                3,
            windowWidth,
            6
        );

        g.endFill();

        /*
         * Curtains.
         */

        this.drawCurtains(
            g,
            windowX,
            windowY,
            windowWidth,
            windowHeight
        );

        Renderer.addToLayer(
            'environment',
            g,
            'window'
        );

        this.graphics.window =
            g;
    },

    // ========================================================
    // CURTAINS
    // ========================================================

    drawCurtains(
        g,
        windowX,
        windowY,
        windowWidth,
        windowHeight
    ) {

        const curtainColor =
            0xffb8c6;

        g.beginFill(
            curtainColor
        );

        /*
         * Left curtain.
         */

        g.moveTo(
            windowX - 9,
            windowY - 8
        );

        g.quadraticCurveTo(
            windowX - 22,
            windowY +
                windowHeight * 0.45,
            windowX - 8,
            windowY +
                windowHeight +
                8
        );

        g.lineTo(
            windowX + 4,
            windowY +
                windowHeight +
                8
        );

        g.quadraticCurveTo(
            windowX - 1,
            windowY +
                windowHeight * 0.45,
            windowX + 4,
            windowY - 8
        );

        g.closePath();

        g.endFill();

        /*
         * Right curtain.
         */

        g.beginFill(
            curtainColor
        );

        g.moveTo(
            windowX +
                windowWidth -
                4,
            windowY - 8
        );

        g.quadraticCurveTo(
            windowX +
                windowWidth +
                1,
            windowY +
                windowHeight * 0.45,
            windowX +
                windowWidth -
                8,
            windowY +
                windowHeight +
                8
        );

        g.lineTo(
            windowX +
                windowWidth +
                9,
            windowY +
                windowHeight +
                8
        );

        g.quadraticCurveTo(
            windowX +
                windowWidth +
                22,
            windowY +
                windowHeight * 0.45,
            windowX +
                windowWidth +
                9,
            windowY - 8
        );

        g.closePath();

        g.endFill();
    },

    // ========================================================
    // SHELF PROPS
    // ========================================================
    //
    // Master Spec §24 ("Environmental Props") / §55 (priority
    // list item 8, "primary environmental props") — the kitchen
    // previously had zero purely-decorative objects; everything
    // visible was either wall/window/counter or a functional
    // gameplay obstacle (audit finding). This is a first, small,
    // deliberately modest addition: a single wall shelf with two
    // jars, placed in genuinely open wall space to the right of
    // the window. The counter itself is already tightly packed
    // with gameplay obstacles across most of its width (griddle,
    // butter ×2, syrup, bowl, plate all sit within roughly
    // x=45–400 of the 420-wide canvas) — adding more objects
    // there risks visually crowding the gameplay plane, so this
    // stays on the wall/background band instead (Art Bible §9).
    // ========================================================

    drawShelfProps() {

        const g =
            Renderer.createGraphics();

        const shelfX = 300;
        const shelfY = 195;
        const shelfWidth = 95;
        const shelfHeight = 8;

        /*
         * Shelf shadow.
         */

        g.beginFill(
            0x000000,
            0.14
        );

        g.drawRoundedRect(
            shelfX,
            shelfY + shelfHeight,
            shelfWidth,
            5,
            2
        );

        g.endFill();

        /*
         * Shelf plank — wood, per Art Bible §5 ("wood used
         * selectively for warmth"). This is exactly that
         * selective use, not the counter itself (which is
         * stone/quartz — see drawCounter()'s mottling comment).
         */

        g.beginFill(
            CONFIG.colors.counter
        );

        g.drawRoundedRect(
            shelfX,
            shelfY,
            shelfWidth,
            shelfHeight,
            2
        );

        g.endFill();

        g.beginFill(
            0xffffff,
            0.18
        );

        g.drawRoundedRect(
            shelfX + 3,
            shelfY + 1,
            shelfWidth - 6,
            1.5,
            1
        );

        g.endFill();

        /*
         * Bracket.
         */

        g.beginFill(
            CONFIG.colors.counterSide,
            0.6
        );

        g.drawRect(
            shelfX + shelfWidth / 2 - 2,
            shelfY + shelfHeight,
            4,
            10
        );

        g.endFill();

        /*
         * Two jars on the shelf — simple glass/ceramic material
         * per Art Bible §5: clean edges, one small highlight,
         * restrained (§7: low texture density).
         */

        this._drawJar(
            g,
            shelfX + 24,
            shelfY,
            16,
            26,
            0xf5ede0,
            0xe0d4b8
        );

        this._drawJar(
            g,
            shelfX + 62,
            shelfY,
            14,
            22,
            0xd4a574,
            0xb98a54
        );

        Renderer.addToLayer(
            'environment',
            g,
            'shelfProps'
        );

        this.graphics.shelfProps =
            g;
    },

    /*
     * Small helper: one simple jar, base anchored at (baseX,
     * baseY) — jar sits ON TOP of that point, growing upward.
     * `contentColor`/`lidColor` let the two shelf jars look
     * subtly different (e.g. flour vs. sugar) without needing
     * two separate drawing functions.
     */
    _drawJar(
        g,
        baseX,
        baseY,
        width,
        height,
        contentColor,
        lidColor
    ) {

        const top =
            baseY - height;

        /*
         * Jar body (glass — clean edges, per Art Bible §5).
         */

        g.beginFill(
            contentColor
        );

        g.drawRoundedRect(
            baseX - width / 2,
            top + 6,
            width,
            height - 6,
            3
        );

        g.endFill();

        /*
         * Lid.
         */

        g.beginFill(
            lidColor
        );

        g.drawRoundedRect(
            baseX - width / 2 - 1,
            top,
            width + 2,
            7,
            2
        );

        g.endFill();

        /*
         * Single clean highlight (Art Bible §5).
         */

        g.beginFill(
            0xffffff,
            0.30
        );

        g.drawRoundedRect(
            baseX - width / 2 + 2,
            top + 9,
            2,
            height - 12,
            1
        );

        g.endFill();
    },

    // ========================================================
    // COUNTER PRESENTATION
    // ========================================================

    drawCounter() {

        const g =
            Renderer.createGraphics();

        const counterY =
            CONFIG.obstacles.counter.y;

        /*
         * Shadow beneath the countertop.
         */

        g.beginFill(
            0x704b32,
            0.18
        );

        g.drawRect(
            0,
            counterY - 3,
            CONFIG.canvasWidth,
            16
        );

        g.endFill();

        /*
         * Countertop surface.
         */

        g.beginFill(
            CONFIG.colors.counterTop
        );

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

        g.beginFill(
            CONFIG.colors.counter
        );

        g.drawRect(
            0,
            counterY + 6,
            CONFIG.canvasWidth,
            Math.max(
                0,
                CONFIG.canvasHeight -
                counterY -
                6
            )
        );

        g.endFill();

        /*
         * Top highlight.
         */

        g.beginFill(
            0xffffff,
            0.30
        );

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

        g.beginFill(
            CONFIG.colors.counterSide,
            0.35
        );

        g.drawRect(
            0,
            counterY + 6,
            CONFIG.canvasWidth,
            4
        );

        g.endFill();

        /*
         * Stone/quartz mottling (Art Bible §5: "Countertop:
         * Stone/quartz... subtle texture... imperfections").
         *
         * Replaces the previous wavy "wood grain" lines here —
         * that treatment belonged to a wood material, but the
         * Art Bible calls for the counter itself to read as
         * stone/quartz (wood is reserved for other props, per
         * Master Spec §23). Soft, low-contrast, irregular
         * blotches rather than a repeating pattern — per Art
         * Bible §7, texture density here should be "easy to
         * miss at a glance," not a focal detail.
         */

        const frontFaceTop =
            counterY + 6;

        const frontFaceHeight =
            Math.max(
                0,
                CONFIG.canvasHeight -
                counterY -
                6
            );

        for (
            let i = 0;
            i < 10;
            i++
        ) {

            const mottleX =
                Math.random() *
                CONFIG.canvasWidth;

            const mottleY =
                frontFaceTop +
                Math.random() *
                frontFaceHeight;

            const mottleRadiusX =
                6 + Math.random() * 14;

            const mottleRadiusY =
                3 + Math.random() * 5;

            const lighter =
                Math.random() > 0.5;

            g.beginFill(
                lighter
                    ? CONFIG.colors.counterTop
                    : CONFIG.colors.counterSide,
                0.08 + Math.random() * 0.06
            );

            g.drawEllipse(
                mottleX,
                mottleY,
                mottleRadiusX,
                mottleRadiusY
            );

            g.endFill();
        }

        Renderer.addToLayer(
            'environment',
            g,
            'counter'
        );

        this.graphics.counter =
            g;
    },

    // ========================================================
    // AMBIENT DUST
    // ========================================================

    createDustMotes() {

        const container =
            new PIXI.Container();

        /*
         * Dust is decorative only.
         * It has no gameplay significance.
         */

        container.zIndex =
            5;

        Renderer.layers.environment.addChild(
            container
        );

        this.graphics.dustContainer =
            container;

        this.graphics.dustMotes =
            [];

        const moteCount =
            10;

        for (
            let i = 0;
            i < moteCount;
            i++
        ) {

            const mote =
                new PIXI.Graphics();

            const radius =
                1 +
                Math.random() * 1.5;

            mote.beginFill(
                0xffffff,
                0.18 +
                Math.random() * 0.20
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
                (
                    CONFIG.canvasWidth -
                    50
                );

            const baseY =
                155 +
                Math.random() *
                360;

            mote.x =
                baseX;

            mote.y =
                baseY;

            container.addChild(
                mote
            );

            this.graphics.dustMotes.push({

                graphic: mote,

                baseX,

                baseY,

                offset:
                    Math.random() *
                    Math.PI *
                    2,

                speed:
                    0.25 +
                    Math.random() *
                    0.45,

                amplitudeX:
                    8 +
                    Math.random() *
                    15,

                amplitudeY:
                    5 +
                    Math.random() *
                    10
            });
        }
    },

    // ========================================================
    // STEAM
    // ========================================================

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
                graphic: steam,
                baseX: steam.x,
                baseY: steam.y,
                speed: 0.2 + Math.random() * 0.3,
                drift: (Math.random() - 0.5) * 0.5,
                scale: 0.8 + Math.random() * 0.6,
                phase: Math.random() * 100
            });
            Renderer.layers.environment.addChild(steam);
        }
    },

    // ========================================================
    // UPDATE
    // ========================================================

    update() {

        if (
            !this.graphics ||
            !this.graphics.dustMotes
        ) {
            return;
        }

        /*
         * This animation is intentionally based on real time.
         *
         * It is visual ambience only and MUST NOT feed back
         * into gameplay or physics.
         */

        const time =
            performance.now() / 1000;

        this.graphics.dustMotes.forEach(
            mote => {

                if (!mote.graphic) {
                    return;
                }

                mote.graphic.x =
                    mote.baseX +
                    Math.sin(
                        time *
                        mote.speed +
                        mote.offset
                    ) *
                    mote.amplitudeX;

                mote.graphic.y =
                    mote.baseY +
                    Math.cos(
                        time *
                        mote.speed *
                        0.7 +
                        mote.offset
                    ) *
                    mote.amplitudeY;

                mote.graphic.alpha =
                    0.65 +
                    Math.sin(
                        time *
                        mote.speed +
                        mote.offset
                    ) *
                    0.2;
            }
        );

        // Steam animation
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

window.Environment =
    Environment;