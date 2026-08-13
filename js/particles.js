// ============================================================
// PANCAKE PLOP! — PARTICLE SYSTEM
// ============================================================
//
// Lightweight visual effects for:
//
// • Pancake flips
// • Pancake landings
// • Level completion
//
// Particles are visual-only.
// They do not interact with Matter.js physics.
//
// All particle positions use the game's logical
// 420 × 750 coordinate system.
//
// Gameplay-triggered particles update on the fixed simulation
// timestep. Purely ambient animation (Environment dust) remains
// render-timestep and is handled separately.
// ============================================================

const Particles = {

    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    items: [],

    container: null,

    maxParticles: 250,


    // --------------------------------------------------------
    // INITIALISE
    // --------------------------------------------------------

    init() {

        /*
         * Particle limits come from CONFIG so there is a single
         * authoritative location for performance tuning.
         */
        this.maxParticles =
            CONFIG.particles.maxParticles;

        /*
         * Graphics objects are used as particles.
         *
         * A normal Pixi Container is therefore more appropriate
         * than ParticleContainer.
         */

        this.container = new PIXI.Container();

        Renderer.layers.particles.addChild(
            this.container
        );

        this.items = [];
    },


    // --------------------------------------------------------
    // CREATE PARTICLE
    // --------------------------------------------------------

    createParticle({
        x,
        y,
        radius = 3,
        color = 0xffd700,
        vx = 0,
        vy = 0,
        gravity = CONFIG.particles.gravity,
        life = CONFIG.particles.defaultLife,
        fadeSpeed = CONFIG.particles.defaultFadeSpeed
    }) {

        if (!this.container) {
            return null;
        }

        /*
         * Prevent uncontrolled particle growth.
         *
         * This is especially important on mobile devices.
         */

        if (
            this.items.length >=
            this.maxParticles
        ) {
            return null;
        }

        const particle =
            new PIXI.Graphics();

        particle.beginFill(color);

        particle.drawCircle(
            0,
            0,
            radius
        );

        particle.endFill();

        particle.x = x;
        particle.y = y;

        particle.vx = vx;
        particle.vy = vy;

        particle.gravity = gravity;

        particle.life = life;
        particle.fadeSpeed = fadeSpeed;

        particle.alpha = 1;

        /*
         * Random rotation gives particles slightly different
         * visual behaviour.
         */

        particle.rotation =
            Math.random() *
            Math.PI *
            2;

        particle.rotationSpeed =
            (Math.random() - 0.5) *
            0.12;

        this.container.addChild(
            particle
        );

        this.items.push(
            particle
        );

        return particle;
    },


    // --------------------------------------------------------
    // FLIP PARTICLES
    // --------------------------------------------------------

    createFlip(x, y) {

        const count =
            CONFIG.particles.maxFlipParticles + 5;

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            const speed =
                2 +
                Math.random() * 5;

            this.createParticle({

                x:
                    x +
                    (Math.random() - 0.5) *
                    12,

                y:
                    y +
                    (Math.random() - 0.5) *
                    8,

                radius:
                    2 +
                    Math.random() * 2,

                color:
                    Math.random() > 0.25
                        ? 0xffd45a
                        : 0xffffff,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed -
                    2,

                gravity:
                    CONFIG.particles.gravity,

                life:
                    CONFIG.particles.defaultLife,

                fadeSpeed:
                    CONFIG.particles.defaultFadeSpeed
            });
        }
    },


    // --------------------------------------------------------
    // LANDING PARTICLES
    // --------------------------------------------------------

    createLanding(x, y) {

        const count =
            CONFIG.particles.maxLandingParticles;

        for (
            let i = 0;
            i < count;
            i++
        ) {

            /*
             * Emit particles upward in a broad arc.
             *
             * Canvas Y increases downward, so upward velocity
             * is negative.
             */

            const angle =
                Math.PI +
                Math.random() *
                Math.PI;

            const speed =
                2 +
                Math.random() * 5;

            this.createParticle({

                x:
                    x +
                    (Math.random() - 0.5) *
                    40,

                y,

                radius:
                    2 +
                    Math.random() * 3,

                color:
                    Math.random() > 0.2
                        ? 0xffe0b3
                        : 0xffffff,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    -Math.random() *
                    5,

                gravity:
                    CONFIG.particles.gravity,

                life:
                    CONFIG.particles.defaultLife,

                fadeSpeed:
                    CONFIG.particles.defaultFadeSpeed
            });
        }
    },


    // --------------------------------------------------------
    // WIN PARTICLES (enhanced with confetti)
    // --------------------------------------------------------

    createWin(x, y) {

        const colors = [

            0xffd700,
            0xff8a65,
            0x7bd88f,
            0x6bcfff,
            0xff9ff3,
            0xffffff,
            0xff6b6b,
            0x4ecdc4,
            0x45b7d1,
            0xf9ca24

        ];

        const count =
            CONFIG.particles.maxWinParticles;

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            const speed =
                3 +
                Math.random() *
                9;

            const color =
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ];

            const size = 2 + Math.random() * 5;
            const isSquare = Math.random() > 0.7;

            const particle = this.createParticle({

                x:
                    x +
                    (Math.random() - 0.5) *
                    80,

                y:
                    y +
                    (Math.random() - 0.5) *
                    40,

                radius: isSquare ? size * 0.8 : size,

                color,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed -
                    4,

                gravity:
                    CONFIG.particles.gravity * 0.6,

                life:
                    1.5 + Math.random() * 1.0,

                fadeSpeed:
                    0.008 + Math.random() * 0.008
            });

            if (particle && isSquare) {
                // Make it a rectangle (confetti)
                particle.clear();
                particle.beginFill(color);
                particle.drawRect(-size/2, -size/2, size, size);
                particle.endFill();
                particle.rotationSpeed = (Math.random() - 0.5) * 0.2;
            }
        }
    },


    // --------------------------------------------------------
    // UPDATE
    //
    // Called from Game.fixedUpdate(), so this advances once
    // per deterministic simulation step. The optional delta
    // allows future callers to scale the step if needed.
    // --------------------------------------------------------

    update(delta = 1) {

        /*
         * Delta is normally a normalized timestep where:
         *
         *     1 = one normal simulation step
         *
         * Using delta prevents particle behaviour from changing
         * dramatically with frame rate.
         */

        const safeDelta =
            Math.max(
                0,
                Math.min(
                    delta,
                    3
                )
            );

        for (
            let i = this.items.length - 1;
            i >= 0;
            i--
        ) {

            const particle =
                this.items[i];

            if (!particle) {
                this.items.splice(i, 1);
                continue;
            }

            /*
             * Position.
             */

            particle.x +=
                particle.vx *
                safeDelta;

            particle.y +=
                particle.vy *
                safeDelta;


            /*
             * Gravity.
             */

            particle.vy +=
                particle.gravity *
                safeDelta;


            /*
             * Rotation.
             */

            particle.rotation +=
                particle.rotationSpeed *
                safeDelta;


            /*
             * Lifetime.
             */

            particle.life -=
                particle.fadeSpeed *
                safeDelta;

            particle.alpha =
                Math.max(
                    0,
                    particle.life
                );


            /*
             * Remove dead particles.
             */

            if (
                particle.life <= 0
            ) {

                if (
                    particle.parent ===
                    this.container
                ) {
                    this.container.removeChild(
                        particle
                    );
                }

                particle.destroy();

                this.items.splice(
                    i,
                    1
                );
            }
        }
    },


    // --------------------------------------------------------
    // CLEAR
    // --------------------------------------------------------

    clear() {

        if (!this.container) {
            return;
        }

        this.items.forEach(
            particle => {

                if (
                    particle &&
                    !particle.destroyed
                ) {
                    particle.destroy();
                }

            }
        );

        this.items = [];

        this.container.removeChildren();
    }
};


// ============================================================
// GLOBAL EXPORT
// ============================================================

window.Particles = Particles;