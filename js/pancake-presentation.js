// ============================================================
// PANCAKE PLOP! — PANCAKE PRESENTATION
// PixiJS visual representation of the Pancake gameplay object
// ============================================================
//
// Architecture split (audit step 1):
//
//   Physics-owned state  → Matter body            (Pancake)
//   Gameplay state       → flip, landing, grounded (Pancake)
//   Visual state          → Pixi Graphics          (this file)
//
// This file owns no gameplay/physics state and never mutates
// Pancake's body, flip counters, or landing logic. It only
// reads Pancake's public state every frame and draws it.
//
// PancakePresentation.init() must run AFTER Pancake.init(),
// since it reads Pancake.body's starting position immediately.
//
// PancakePresentation.renderUpdate() runs during
// Game.renderUpdate() — once per rendered frame, independent
// of the fixed physics timestep.
// ============================================================

const PancakePresentation = {

    // --------------------------------------------------------
    // PIXI
    // --------------------------------------------------------

    graphics: null,

    // Danger zone graphics
    dangerGraphics: null,

    // --------------------------------------------------------
    // INITIALISE
    // --------------------------------------------------------

    init() {

        /*
         * Remove the previous visual.
         */

        if (
            this.graphics &&
            this.graphics.parent
        ) {
            this.graphics.parent.removeChild(
                this.graphics
            );
        }

        // ----------------------------------------------------
        // CREATE PIXI VISUAL
        // ----------------------------------------------------

        this.graphics =
            new PIXI.Graphics();

        Renderer.layers.pancake.addChild(
            this.graphics
        );

        this.updateGraphics();

        // ----------------------------------------------------
        // DANGER ZONE GRAPHICS
        // ----------------------------------------------------

        if (!this.dangerGraphics) {
            this.dangerGraphics = new PIXI.Graphics();
            Renderer.layers.effects.addChild(this.dangerGraphics);
            this.dangerGraphics.zIndex = 5;
            this.dangerGraphics.visible = false;
        }

        console.log(
            'PancakePresentation initialized.'
        );
    },

    // --------------------------------------------------------
    // HIDE DANGER ZONE
    // Called by Pancake.flip()
    // --------------------------------------------------------

    hideDangerZone() {

        if (this.dangerGraphics) {
            this.dangerGraphics.visible = false;
            this.dangerGraphics.clear();
        }
    },

    // --------------------------------------------------------
    // DRAW PANCAKE (always draw face)
    // --------------------------------------------------------

    drawPancakeGraphics() {

        if (!this.graphics) {
            return;
        }

        const g =
            this.graphics;

        g.clear();

        const width =
            CONFIG.pancake.width;

        const height =
            CONFIG.pancake.height;

        // ----------------------------------------------------
        // SHADOW
        // ----------------------------------------------------

        if (Pancake.isGrounded) {

            g.beginFill(
                0x000000,
                0.14
            );

            g.drawEllipse(
                0,
                height * 0.48,
                width / 2 + 4,
                4
            );

            g.endFill();
        }

        // ----------------------------------------------------
        // PANCAKE BODY
        // ----------------------------------------------------

        /*
         * Solid colour body.
         *
         * No gradient.
         */

        g.beginFill(
            CONFIG.colors.pancake
        );

        g.drawRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            CONFIG.pancake.cornerRadius
        );

        g.endFill();

        // ----------------------------------------------------
        // EDGE
        // ----------------------------------------------------

        g.lineStyle(
            1.5,
            0xc48030,
            0.95
        );

        g.drawRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            CONFIG.pancake.cornerRadius
        );

        // ----------------------------------------------------
        // TOP HIGHLIGHT
        // ----------------------------------------------------

        g.beginFill(
            0xffffff,
            0.16
        );

        g.drawRoundedRect(
            -width / 2 + 5,
            -height / 2 + 2,
            width - 10,
            3,
            2
        );

        g.endFill();

        // ----------------------------------------------------
        // COOKING SPOTS
        // ----------------------------------------------------

        g.beginFill(
            0xb97832,
            0.25
        );

        g.drawCircle(
            -18,
            -2,
            2
        );

        g.drawCircle(
            8,
            1,
            2
        );

        g.drawCircle(
            21,
            -2,
            1.5
        );

        g.drawCircle(
            -4,
            -1,
            1.5
        );

        g.endFill();

        // ----------------------------------------------------
        // BUTTER
        // ----------------------------------------------------

        const rawAngle =
            Pancake.body
                ? Pancake.body.angle
                : 0;

        /*
         * Clamp angle to [-π, π] manually.
         */

        const clampedAngle =
            Math.max(
                -Math.PI,
                Math.min(
                    Math.PI,
                    rawAngle
                )
            );

        const normalizedAngle =
            Math.abs(
                clampedAngle
            );

        const roughlyFlat =
            normalizedAngle <
                CONFIG.gameplay.landing.angleTolerance ||
            Math.abs(
                normalizedAngle - Math.PI
            ) <
                CONFIG.gameplay.landing.angleTolerance;

        if (roughlyFlat) {

            g.beginFill(
                CONFIG.colors.butter
            );

            g.drawRoundedRect(
                -10,
                -9,
                20,
                10,
                2
            );

            g.endFill();

            g.beginFill(
                CONFIG.colors.butterShadow
            );

            g.drawRect(
                -10,
                -1,
                20,
                2
            );

            g.endFill();

            g.beginFill(
                0xffffff,
                0.4
            );

            g.drawRect(
                -7,
                -7,
                7,
                2
            );

            g.endFill();
        }

        // ----------------------------------------------------
        // FACE - ALWAYS DRAWN
        // ----------------------------------------------------

        // Eyes
        g.beginFill(
            0x333333
        );

        g.drawCircle(
            -15,
            0,
            2.5
        );

        g.drawCircle(
            15,
            0,
            2.5
        );

        g.endFill();

        // Eye highlights
        g.beginFill(
            0xffffff
        );

        g.drawCircle(
            -14,
            -1,
            1
        );

        g.drawCircle(
            16,
            -1,
            1
        );

        g.endFill();

        // Cheeks
        g.beginFill(
            0xff9696,
            0.38
        );

        g.drawCircle(
            -22,
            3,
            4
        );

        g.drawCircle(
            22,
            3,
            4
        );

        g.endFill();

        // Mouth
        g.beginFill(
            0x333333
        );

        if (Pancake.isResting) {

            g.drawRoundedRect(
                -6,
                1,
                12,
                4,
                2
            );

        } else {

            g.drawRect(
                -5,
                3,
                10,
                2
            );
        }

        g.endFill();
    },

    // --------------------------------------------------------
    // UPDATE GRAPHICS
    // --------------------------------------------------------

    updateGraphics() {

        if (
            !Pancake.body ||
            !this.graphics
        ) {
            return;
        }

        /*
         * Interpolate render position between the last two
         * physics steps rather than snapping straight to the
         * latest step (audit fix — Master Spec §36). `alpha` is
         * how far we are into the *next*, not-yet-simulated
         * step: 0 = exactly at previousPosition/previousAngle,
         * 1 = exactly at the current body transform.
         *
         * This never affects the simulation itself — only where
         * this frame draws the pancake. Physics.step() keeps
         * previousPosition/previousAngle one step behind the
         * live body via Pancake.snapshotPreviousState(), and
         * Pancake.syncPreviousState() collapses the gap to zero
         * right after any deliberate teleport (landing snap,
         * butter bounce, screen wrap) so interpolation never
         * smooths across an intentional jump.
         */

        const alpha =
            (
                typeof Game !== 'undefined' &&
                Game.FIXED_STEP
            )
                ? Math.max(
                    0,
                    Math.min(
                        1,
                        Game.accumulator /
                        Game.FIXED_STEP
                    )
                )
                : 1;

        const prevPos =
            Pancake.previousPosition;

        const currPos =
            Pancake.body.position;

        this.graphics.x =
            prevPos.x +
            (currPos.x - prevPos.x) *
            alpha;

        this.graphics.y =
            prevPos.y +
            (currPos.y - prevPos.y) *
            alpha;

        const prevAngle =
            Pancake.previousAngle;

        const currAngle =
            Pancake.body.angle;

        this.graphics.rotation =
            prevAngle +
            (currAngle - prevAngle) *
            alpha;

        this.drawPancakeGraphics();
    },

    // --------------------------------------------------------
    // RENDER UPDATE
    // --------------------------------------------------------

    renderUpdate() {

        this.updateGraphics();

        // Danger zone: if pancake y > counterY + 100, show red warning
        if (Pancake.body && Pancake.body.position.y > CONFIG.obstacles.counter.y + 100) {
            if (this.dangerGraphics) {
                this.dangerGraphics.visible = true;
                this.dangerGraphics.clear();
                const alpha = Math.min(1, (Pancake.body.position.y - CONFIG.obstacles.counter.y - 100) / 100);
                this.dangerGraphics.beginFill(0xff0000, alpha * 0.3);
                this.dangerGraphics.drawRect(0, CONFIG.canvasHeight - 40, CONFIG.canvasWidth, 40);
                this.dangerGraphics.endFill();
                this.dangerGraphics.lineStyle(3, 0xff0000, alpha * 0.6);
                this.dangerGraphics.drawRect(0, CONFIG.canvasHeight - 40, CONFIG.canvasWidth, 40);
            }
        } else {
            if (this.dangerGraphics) {
                this.dangerGraphics.visible = false;
                this.dangerGraphics.clear();
            }
        }
    }
};


// ============================================================
// PRESENTATION EVENT SUBSCRIPTIONS
// ============================================================
//
// Registered once at load time — see particles.js for why.
// ============================================================

PresentationEvents.on('launch', () => {
    PancakePresentation.hideDangerZone();
});

window.PancakePresentation = PancakePresentation;
