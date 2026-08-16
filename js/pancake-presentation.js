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

    /*
     * Irregular silhouette control points, in local drawing
     * space (0,0 = pancake centre, matching the physics body's
     * own local frame). Generated once per PancakePresentation.
     * init() call — NOT regenerated every frame, both for
     * performance and because regenerating with fresh randomness
     * every frame would make the outline visibly jitter/vibrate.
     */
    blobPoints: null,

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

        /*
         * Seed derived from the level number, so a given level's
         * pancake looks the same across every flip within it
         * (Art Bible: consistent, not flickering between
         * shapes), while different levels look subtly different
         * from each other (Master Spec §4: "different pancakes
         * may have subtle procedural variation, but every
         * variation belongs to the same visual family").
         */

        const seed =
            (typeof Game !== 'undefined' && Game.level)
                ? Game.level * 7919 + 13
                : 12345;

        PancakeMaterial.init(
            seed
        );

        /*
         * Large prime offset so the silhouette's random sequence
         * doesn't correlate with the browning spots' sequence
         * (both ultimately derive from the same level seed, but
         * shouldn't produce visually "linked" patterns).
         */

        this.generateBlobPoints(
            seed + 104729
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
    // SEEDED RANDOM
    // --------------------------------------------------------

    /*
     * Same small deterministic PRNG as PancakeMaterial (kept
     * local rather than shared — both files are meant to stand
     * alone). A given seed always produces the same sequence.
     */
    _makeRandom(seed) {

        let state =
            (seed % 2147483647) || 1;

        if (state <= 0) {
            state += 2147483646;
        }

        return () => {

            state =
                (state * 16807) % 2147483647;

            return (state - 1) / 2147483646;
        };
    },

    // --------------------------------------------------------
    // SILHOUETTE GENERATION
    // --------------------------------------------------------

    /*
     * Builds an irregular "blob" outline around an ellipse the
     * same size as the physics body (Art Bible §2: visual may
     * extend slightly beyond the body, never dramatically —
     * jitter is capped at ±14%). Points are consumed by
     * traceBlobPath() as a smooth closed curve, not a jagged
     * polygon.
     */
    generateBlobPoints(seed) {

        const random =
            this._makeRandom(
                seed
            );

        const pointCount = 12;

        const halfWidth =
            CONFIG.pancake.width / 2;

        const halfHeight =
            CONFIG.pancake.height / 2;

        const points = [];

        for (let i = 0; i < pointCount; i++) {

            const angle =
                (Math.PI * 2 * i) /
                pointCount;

            /*
             * 0.86 - 1.14 — a soft, organic irregularity, not a
             * spiky/jagged one.
             */
            const jitter =
                0.86 + random() * 0.28;

            points.push({

                x:
                    Math.cos(angle) *
                    halfWidth *
                    jitter,

                y:
                    Math.sin(angle) *
                    halfHeight *
                    jitter
            });
        }

        this.blobPoints = points;
    },

    /*
     * Traces `points` as a smooth closed blob outline using
     * quadratic curves through each edge's midpoint — the
     * standard "smooth blob through N points" technique. Must be
     * called between a beginFill()/endFill() pair to fill it, or
     * after a lineStyle() call (with no active fill) to stroke
     * it only — same pattern PixiJS Graphics always uses.
     */
    traceBlobPath(g, points) {

        if (
            !points ||
            points.length < 3
        ) {
            return;
        }

        const midpoint =
            (a, b) => ({
                x: (a.x + b.x) / 2,
                y: (a.y + b.y) / 2
            });

        const start =
            midpoint(
                points[points.length - 1],
                points[0]
            );

        g.moveTo(
            start.x,
            start.y
        );

        for (let i = 0; i < points.length; i++) {

            const current =
                points[i];

            const next =
                points[(i + 1) % points.length];

            const mid =
                midpoint(
                    current,
                    next
                );

            g.quadraticCurveTo(
                current.x,
                current.y,
                mid.x,
                mid.y
            );
        }

        g.closePath();
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

        const hasBlob =
            this.blobPoints &&
            this.blobPoints.length >= 3;

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
        // PANCAKE BODY — irregular silhouette
        //
        // Art Bible §1/§6: organic, soft-edged, matte. Falls
        // back to the original rounded rect only if blob points
        // somehow weren't generated (defensive; init() always
        // generates them, so this shouldn't be reachable).
        // ----------------------------------------------------

        g.beginFill(
            CONFIG.colors.pancake
        );

        if (hasBlob) {
            this.traceBlobPath(
                g,
                this.blobPoints
            );
        } else {
            g.drawRoundedRect(
                -width / 2,
                -height / 2,
                width,
                height,
                CONFIG.pancake.cornerRadius
            );
        }

        g.endFill();

        // ----------------------------------------------------
        // SOFT LIT SHADING
        //
        // Art Bible §4: single warm light, upper-left. Layered
        // semi-transparent ellipses simulate a soft gradient —
        // a real PIXI v7 gradient IS achievable via a canvas-
        // generated texture fill (the original code's "v7 has
        // no gradient" comment was incomplete, not accurate),
        // but that carries real matrix-alignment risk on a
        // rotating body. This layered-shape technique is the
        // well-established, low-risk equivalent, used here for
        // the hero asset until a texture-fill version has been
        // visually verified in a real browser.
        // ----------------------------------------------------

        g.beginFill(
            CONFIG.colors.pancakeDark,
            0.16
        );

        g.drawEllipse(
            width * 0.12,
            height * 0.22,
            width * 0.42,
            height * 0.7
        );

        g.endFill();

        g.beginFill(
            CONFIG.colors.pancakeLight,
            0.30
        );

        g.drawEllipse(
            -width * 0.14,
            -height * 0.28,
            width * 0.32,
            height * 0.55
        );

        g.endFill();

        g.beginFill(
            CONFIG.colors.pancakeLight,
            0.22
        );

        g.drawEllipse(
            -width * 0.20,
            -height * 0.34,
            width * 0.16,
            height * 0.3
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

        if (hasBlob) {
            this.traceBlobPath(
                g,
                this.blobPoints
            );
        } else {
            g.drawRoundedRect(
                -width / 2,
                -height / 2,
                width,
                height,
                CONFIG.pancake.cornerRadius
            );
        }

        /*
         * Explicitly clear the line style before drawing
         * anything else this frame.
         *
         * (Found in passing while rewriting this function: the
         * original code never did this, so lineStyle(1.5,
         * 0xc48030, 0.95) stayed active for every shape drawn
         * afterward in the same frame — the highlight rect,
         * cooking-spot circles, butter pat, and every face
         * feature all picked up an unintended thin orange-brown
         * outline. Small shapes like the 2.5px-radius eyes would
         * have been the most visibly affected. This is a real
         * fix, not a behavior-preserving change — flagged here
         * since this pass is explicitly visual/CREATE work, not
         * the earlier zero-behavior-change architecture passes.)
         */

        g.lineStyle(0);

        // ----------------------------------------------------
        // BROWNING — spatially-varied, data-driven
        //
        // Master Spec §6: "browning should vary spatially...
        // different areas can become lighter, darker, golden,
        // charred." Replaces the old 4 hardcoded circle
        // positions with PancakeMaterial.browningSpots (seeded
        // per level) at an alpha driven by PancakeMaterial.
        // browning (currently a fixed default — not yet wired
        // to any cooking/heat gameplay event).
        // ----------------------------------------------------

        const browning =
            PancakeMaterial.browning;

        PancakeMaterial.browningSpots.forEach(spot => {

            const spotAlpha =
                Math.max(
                    0,
                    Math.min(
                        0.55,
                        spot.intensity * browning
                    )
                );

            if (spotAlpha <= 0.01) {
                return;
            }

            g.beginFill(
                0xb97832,
                spotAlpha
            );

            g.drawEllipse(
                spot.x,
                spot.y,
                spot.radiusX,
                spot.radiusY
            );

            g.endFill();
        });

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
