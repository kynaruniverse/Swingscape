// ============================================================
// PANCAKE PLOP! — PANCAKE SYSTEM
// Gameplay state + Matter.js body + PixiJS visual
// ============================================================
//
// Phase 6 separation:
//
//   Physics-owned state  → Matter body
//   Gameplay state       → flip, landing, grounded, cooldown
//   Visual state         → Pixi Graphics
//
// Pancake.fixedUpdate() runs only during Game.fixedUpdate().
// Pancake.renderUpdate() runs during Game.renderUpdate().
// ============================================================

const Pancake = {

    // --------------------------------------------------------
    // PHYSICS
    // --------------------------------------------------------

    body: null,

    // --------------------------------------------------------
    // GAMEPLAY STATE
    // --------------------------------------------------------

    isResting: true,
    isGrounded: false,

    hasFlipped: false,

    canFlipAgain: true,

    flipCooldown: 0,

    flipCount: 0,

    restingTime: 0,

    landingHandled: false,

    lastSurface: null,

    /*
     * Physics owns the actual collision events.
     *
     * We keep a set of currently touching surface labels
     * so the pancake can reliably determine whether it is
     * grounded.
     */
    contactSurfaces: new Set(),

    // --------------------------------------------------------
    // TRAIL
    // --------------------------------------------------------

    trailPositions: [],

    // --------------------------------------------------------
    // PIXI
    // --------------------------------------------------------

    graphics: null,

    // --------------------------------------------------------
    // INITIALISE
    // --------------------------------------------------------

    init() {

        /*
         * Remove the previous physics body.
         */

        if (
            this.body &&
            Physics.world
        ) {
            Physics.removeBody(
                this.body
            );
        }

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
        // CREATE MATTER BODY
        // ----------------------------------------------------

        this.body = Matter.Bodies.rectangle(
            CONFIG.pancake.start.x,
            CONFIG.startY,
            CONFIG.pancake.width,
            CONFIG.pancake.height,
            {
                label: 'pancake',

                density:
                    CONFIG.pancake.density,

                friction:
                    CONFIG.pancake.friction,

                frictionStatic:
                    CONFIG.pancake.friction,

                frictionAir:
                    CONFIG.pancake.frictionAir,

                restitution:
                    CONFIG.pancake.restitution,

                angle: 0,

                chamfer: {
                    radius:
                        CONFIG.pancake.cornerRadius
                },

                sleepThreshold: Infinity
            }
        );

        // ----------------------------------------------------
        // RESET STATE
        // ----------------------------------------------------

        this.isResting = true;
        this.isGrounded = true;

        this.hasFlipped = false;

        this.canFlipAgain = true;

        this.flipCooldown = 0;

        this.flipCount = 0;

        this.restingTime = 0;

        this.landingHandled = false;

        this.lastSurface = null;

        this.contactSurfaces.clear();

        this.contactSurfaces.add(
            'counter'
        );

        this.trailPositions = [];

        // ----------------------------------------------------
        // ADD TO PHYSICS WORLD
        // ----------------------------------------------------

        Physics.addBody(
            this.body
        );

        // ----------------------------------------------------
        // CREATE PIXI VISUAL
        // ----------------------------------------------------

        this.graphics =
            new PIXI.Graphics();

        Renderer.layers.pancake.addChild(
            this.graphics
        );

        this.updateGraphics();

        console.log(
            'Pancake initialized:',
            this.body.position.x,
            this.body.position.y
        );
    },

    // --------------------------------------------------------
    // DRAW PANCAKE
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

        if (this.isGrounded) {

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

        const gradient =
            new PIXI.FillGradient(
                0,
                -height / 2,
                0,
                height / 2
            );

        gradient.addColorStop(
            0,
            CONFIG.colors.pancakeLight
        );

        gradient.addColorStop(
            0.5,
            CONFIG.colors.pancake
        );

        gradient.addColorStop(
            1,
            CONFIG.colors.pancakeDark
        );

        g.beginFill(
            gradient
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

        const normalizedAngle =
            Math.abs(
                Matter.Common.clamp(
                    this.body
                        ? this.body.angle
                        : 0,
                    -Math.PI,
                    Math.PI
                )
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
        // FACE
        // ----------------------------------------------------

        if (
            typeof Game !== 'undefined' &&
            Game.state !== 'playing'
        ) {
            return;
        }

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

        g.lineStyle(
            2,
            0x333333,
            1
        );

        if (this.isResting) {

            g.arc(
                0,
                1,
                6,
                0.15 * Math.PI,
                0.85 * Math.PI
            );

        } else {

            g.moveTo(
                -5,
                4
            );

            g.lineTo(
                5,
                4
            );
        }

        g.stroke();
    },

    // --------------------------------------------------------
    // UPDATE GRAPHICS
    // --------------------------------------------------------

    updateGraphics() {

        if (
            !this.body ||
            !this.graphics
        ) {
            return;
        }

        this.graphics.x =
            this.body.position.x;

        this.graphics.y =
            this.body.position.y;

        this.graphics.rotation =
            this.body.angle;

        this.drawPancakeGraphics();
    },

    // --------------------------------------------------------
    // FLIP
    // --------------------------------------------------------

    flip(power) {

        if (!this.body) {
            return false;
        }

        if (!this.canFlip()) {
            return false;
        }

        const normalizedPower =
            Math.max(
                0,
                Math.min(
                    1,
                    Number(power || 0) /
                    CONFIG.gameplay.flip.maxPower
                )
            );

        // ----------------------------------------------------
        // WAKE BODY
        // ----------------------------------------------------

        Matter.Sleeping.set(
            this.body,
            false
        );

        // ----------------------------------------------------
        // CALCULATE VELOCITY
        // ----------------------------------------------------

        const upwardVelocity =
            -(
                CONFIG.gameplay.flip.upwardVelocityMin +
                normalizedPower *
                (
                    CONFIG.gameplay.flip.upwardVelocityMax -
                    CONFIG.gameplay.flip.upwardVelocityMin
                )
            );

        const forwardVelocity =
            CONFIG.gameplay.flip.forwardVelocityMin +
            normalizedPower *
            (
                CONFIG.gameplay.flip.forwardVelocityMax -
                CONFIG.gameplay.flip.forwardVelocityMin
            );

        Matter.Body.setVelocity(
            this.body,
            {
                x: forwardVelocity,
                y: upwardVelocity
            }
        );

        // ----------------------------------------------------
        // ROTATION
        // ----------------------------------------------------

        const angularVelocity =
            CONFIG.gameplay.flip.angularVelocityMin +
            normalizedPower *
            (
                CONFIG.gameplay.flip.angularVelocityMax -
                CONFIG.gameplay.flip.angularVelocityMin
            );

        Matter.Body.setAngularVelocity(
            this.body,
            angularVelocity
        );

        // ----------------------------------------------------
        // STATE
        // ----------------------------------------------------

        this.isResting = false;

        this.isGrounded = false;

        this.hasFlipped = true;

        this.canFlipAgain = false;

        this.flipCooldown =
            CONFIG.gameplay.flip.cooldown;

        this.restingTime = 0;

        this.contactSurfaces.clear();

        this.lastSurface = null;

        this.landingHandled = false;

        this.flipCount++;

        this.trailPositions = [];

        // ----------------------------------------------------
        // PARTICLES
        // ----------------------------------------------------

        if (
            typeof Particles !== 'undefined'
        ) {
            Particles.createFlip(
                this.body.position.x,
                this.body.position.y
            );
        }

        return true;
    },

    // --------------------------------------------------------
    // CAN FLIP
    // --------------------------------------------------------

    canFlip() {

        if (!this.body) {
            return false;
        }

        if (
            typeof Game !== 'undefined' &&
            Game.state !== 'playing'
        ) {
            return false;
        }

        if (!this.canFlipAgain) {
            return false;
        }

        /*
         * The pancake must be grounded.
         *
         * This prevents accidental mid-air re-flips.
         */
        if (!this.isGrounded) {
            return false;
        }

        return true;
    },

    // --------------------------------------------------------
    // BODY IDENTIFICATION
    // --------------------------------------------------------

    isPancake(body) {

        return !!(
            body &&
            body.label === 'pancake'
        );
    },

    // --------------------------------------------------------
    // AIRBORNE STATE
    // --------------------------------------------------------

    isInAir() {

        return !!(
            this.body &&
            !this.isGrounded
        );
    },

    // --------------------------------------------------------
    // CONTACT START
    // Called by Physics
    // --------------------------------------------------------

    beginContact(otherBody) {

        if (
            !this.body ||
            !otherBody
        ) {
            return;
        }

        const validSurfaces = [
            'counter',
            'griddle',
            'plate',
            'butter'
        ];

        if (
            !validSurfaces.includes(
                otherBody.label
            )
        ) {
            return;
        }

        this.contactSurfaces.add(
            otherBody.label
        );

        this.lastSurface =
            otherBody;

        /*
         * We do NOT immediately call land().
         *
         * The pancake may still be moving too quickly.
         * fixedUpdate() will decide when the landing is
         * actually valid.
         */

        this.updateGroundedState();
    },

    // --------------------------------------------------------
    // CONTACT END
    // Called by Physics
    // --------------------------------------------------------

    endContact(otherBody) {

        if (
            !otherBody
        ) {
            return;
        }

        this.contactSurfaces.delete(
            otherBody.label
        );

        this.updateGroundedState();
    },

    // --------------------------------------------------------
    // GROUND STATE
    // --------------------------------------------------------

    updateGroundedState() {

        const grounded =
            this.contactSurfaces.size > 0;

        this.isGrounded =
            grounded;

        if (!grounded) {

            this.isResting =
                false;

            this.restingTime =
                0;

            return;
        }

        /*
         * Grounded does not automatically mean landed.
         *
         * The body still needs to be moving slowly enough.
         */
    },

    // --------------------------------------------------------
    // FIXED UPDATE
    // --------------------------------------------------------

    fixedUpdate(deltaTime = CONFIG.physics.fixedDeltaTime) {

        if (!this.body) {
            return;
        }

        const dt =
            Math.max(
                0,
                Math.min(
                    CONFIG.physics.maxFrameDelta,
                    deltaTime
                )
            );

        // ----------------------------------------------------
        // FLIP COOLDOWN
        // ----------------------------------------------------

        if (
            this.flipCooldown > 0
        ) {

            this.flipCooldown -= dt;

            if (
                this.flipCooldown <= 0
            ) {
                this.flipCooldown = 0;
                this.canFlipAgain = true;
            }
        }

        // ----------------------------------------------------
        // GROUND STATE
        // ----------------------------------------------------

        this.updateGroundedState();

        // ----------------------------------------------------
        // LANDING
        // ----------------------------------------------------

        this.checkLanding();

        // ----------------------------------------------------
        // RESTING TIME
        // ----------------------------------------------------

        if (this.isResting) {

            this.restingTime += dt;

        } else {

            this.restingTime = 0;
        }

        // ----------------------------------------------------
        // TRAIL
        // ----------------------------------------------------

        this.updateTrail();
    },

    // --------------------------------------------------------
    // RENDER UPDATE
    // --------------------------------------------------------

    renderUpdate() {

        this.updateGraphics();
    },

    // --------------------------------------------------------
    // FALL CHECK
    // --------------------------------------------------------

    checkFell() {

        if (!this.body) {
            return false;
        }

        if (
            this.body.position.y >
            CONFIG.fallY
        ) {

            if (
                typeof Game !== 'undefined'
            ) {
                Game.lose();
            }

            return true;
        }

        return false;
    },

    // --------------------------------------------------------
    // TRAIL
    // --------------------------------------------------------

    updateTrail() {

        if (
            this.hasFlipped &&
            this.body
        ) {

            this.trailPositions.push({
                x:
                    this.body.position.x,

                y:
                    this.body.position.y,

                life: 1
            });
        }

        /*
         * Keep the trail bounded.
         */

        const maxTrail =
            CONFIG.particles.maxParticles > 0
                ? CONFIG.particles.maxParticles
                : 300;

        if (
            this.trailPositions.length >
            maxTrail
        ) {

            this.trailPositions.shift();
        }

        const trailFadeRate =
            0.03;

        const trailGravity =
            0.05;

        for (
            let i =
                this.trailPositions.length - 1;

            i >= 0;

            i--
        ) {

            const trail =
                this.trailPositions[i];

            trail.life -=
                trailFadeRate;

            trail.y +=
                trailGravity;

            if (
                trail.life <= 0
            ) {

                this.trailPositions.splice(
                    i,
                    1
                );
            }
        }
    },

    // --------------------------------------------------------
    // LANDING CHECK
    // --------------------------------------------------------

    checkLanding() {

        if (
            !this.body ||
            !this.hasFlipped ||
            this.landingHandled
        ) {
            return;
        }

        if (
            this.contactSurfaces.size === 0
        ) {
            return;
        }

        const velocity =
            this.body.velocity;

        const speed =
            Math.sqrt(
                velocity.x * velocity.x +
                velocity.y * velocity.y
            );

        const angularSpeed =
            Math.abs(
                this.body.angularVelocity
            );

        /*
         * Wait until both linear and rotational movement
         * have settled sufficiently.
         */

        if (
            speed >
            CONFIG.gameplay.landing.maxSpeed
        ) {
            return;
        }

        if (
            angularSpeed >
            CONFIG.gameplay.landing.maxAngularVelocity
        ) {
            return;
        }

        /*
         * Find the most important surface currently touching.
         */

        let surface =
            this.lastSurface;

        if (
            !surface ||
            !this.contactSurfaces.has(
                surface.label
            )
        ) {

            const surfaceLabel =
                this.contactSurfaces.values()
                    .next()
                    .value;

            if (!surfaceLabel) {
                return;
            }

            surface = {
                label: surfaceLabel
            };
        }

        this.land(
            surface
        );
    },

    // --------------------------------------------------------
    // LAND
    // --------------------------------------------------------

    land(surface) {

        if (
            !this.body ||
            this.landingHandled
        ) {
            return;
        }

        this.landingHandled =
            true;

        this.isResting =
            true;

        this.isGrounded =
            true;

        this.hasFlipped =
            false;

        this.lastSurface =
            surface;

        this.restingTime =
            0;

        /*
         * Stop small residual movement.
         */

        Matter.Body.setVelocity(
            this.body,
            {
                x:
                    this.body.velocity.x *
                    0.15,

                y: 0
            }
        );

        Matter.Body.setAngularVelocity(
            this.body,
            0
        );

        /*
         * Snap to the nearest flat orientation.
         *
         * This allows either face of the pancake to land flat.
         */

        const fullRotation =
            Math.PI * 2;

        let angle =
            this.body.angle %
            fullRotation;

        if (angle < 0) {
            angle += fullRotation;
        }

        const distanceToZero =
            Math.min(
                angle,
                fullRotation - angle
            );

        const distanceToPi =
            Math.abs(
                angle - Math.PI
            );

        const targetAngle =
            distanceToZero <= distanceToPi
                ? 0
                : Math.PI;

        Matter.Body.setAngle(
            this.body,
            targetAngle
        );

        // ----------------------------------------------------
        // PARTICLES
        // ----------------------------------------------------

        if (
            typeof Particles !== 'undefined'
        ) {
            Particles.createLanding(
                this.body.position.x,
                this.body.position.y
            );
        }

        // ----------------------------------------------------
        // PLATE = EVALUATE LANDING
        // ----------------------------------------------------

        if (
            surface.label === 'plate'
        ) {

            const isFaceUp =
                this.isFaceUp();

            if (isFaceUp) {

                if (
                    typeof Game !== 'undefined'
                ) {
                    Game.win();
                }

            } else {

                /*
                 * A face-down pancake on the plate is a bad
                 * landing.
                 */
                if (
                    typeof Game !== 'undefined'
                ) {
                    Game.lose();
                }
            }

            return;
        }

        // ----------------------------------------------------
        // BUTTER = BOUNCE
        // ----------------------------------------------------

        if (
            surface.label === 'butter'
        ) {

            const bounceX =
                this.body.velocity.x *
                CONFIG.obstacles.butter.bounceVelocityMultiplier;

            const bounceY =
                -Math.max(
                    CONFIG.obstacles.butter.minimumBounceVelocity,
                    Math.abs(
                        this.body.velocity.y
                    ) *
                    CONFIG.obstacles.butter.restitution
                );

            Matter.Body.setVelocity(
                this.body,
                {
                    x: bounceX,
                    y: bounceY
                }
            );

            const bounceAngularVelocity =
                CONFIG.gameplay.flip.angularVelocityMin;

            Matter.Body.setAngularVelocity(
                this.body,
                bounceAngularVelocity
            );

            this.isResting =
                false;

            this.isGrounded =
                false;

            this.hasFlipped =
                true;

            this.landingHandled =
                false;

            this.contactSurfaces.clear();

            if (
                typeof UI !== 'undefined'
            ) {
                UI.showMessage(
                    'Boing! 🧈'
                );
            }

            return;
        }

        // ----------------------------------------------------
        // NORMAL SURFACES
        // ----------------------------------------------------

        if (
            surface.label === 'counter' ||
            surface.label === 'griddle'
        ) {

            this.canFlipAgain =
                true;

            if (
                typeof UI !== 'undefined'
            ) {
                UI.showMessage(
                    'Nice! Flip again! 🥞'
                );
            }
        }
    },

    // --------------------------------------------------------
    // FACE-UP CHECK
    // --------------------------------------------------------

    isFaceUp() {

        if (!this.body) {
            return true;
        }

        const tolerance =
            CONFIG.gameplay.landing.angleTolerance;

        const fullRotation =
            Math.PI * 2;

        let angle =
            this.body.angle %
            fullRotation;

        if (angle < 0) {
            angle += fullRotation;
        }

        const distanceToZero =
            Math.min(
                angle,
                fullRotation - angle
            );

        return distanceToZero <= tolerance;
    }
};

window.Pancake = Pancake;