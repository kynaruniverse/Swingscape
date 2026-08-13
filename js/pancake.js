// Pancake Logic - Physics + PixiJS Rendering
const Pancake = {
    body: null,

    isResting: true,
    restingTime: 0,

    flipCount: 0,

    trailPositions: [],

    hasFlipped: false,
    canFlipAgain: true,

    lastFlipTime: 0,

    contactCount: 0,

    graphics: null,

    faceGraphics: null,

    lastSurface: null,

    landingHandled: false,

    init() {
        // Remove the previous pancake from the physics world.
        if (this.body && Physics.world) {
            Physics.removeBody(this.body);
        }

        // Remove previous pancake graphics.
        if (this.graphics && this.graphics.parent) {
            this.graphics.parent.removeChild(this.graphics);
        }

        const { Bodies } = Matter;

        this.body = Bodies.rectangle(
            CONFIG.startX,
            CONFIG.counterY - 25,
            CONFIG.pancakeWidth,
            CONFIG.pancakeHeight,
            {
                friction: CONFIG.pancakeFriction,
                restitution: CONFIG.pancakeRestitution,
                density: CONFIG.pancakeDensity,
                label: 'pancake',

                angle: 0,

                chamfer: {
                    radius: 7
                },

                frictionAir: 0.01,

                // Prevent extreme angular behaviour.
                inertia: Infinity
            }
        );

        this.isResting = true;
        this.restingTime = 0;
        this.flipCount = 0;
        this.trailPositions = [];
        this.hasFlipped = false;
        this.canFlipAgain = true;
        this.lastFlipTime = 0;
        this.contactCount = 1;
        this.lastSurface = null;
        this.landingHandled = false;

        Physics.addBody(this.body);

        // Create the pancake visual.
        this.graphics = new PIXI.Graphics();

        this.drawPancakeGraphics();

        Renderer.layers.pancake.addChild(this.graphics);

        this.updateGraphics();

        console.log(
            'Pancake initialized:',
            this.body.position.x,
            this.body.position.y
        );
    },

    drawPancakeGraphics() {
        if (!this.graphics) {
            return;
        }

        const g = this.graphics;

        g.clear();

        const width = CONFIG.pancakeWidth;
        const height = CONFIG.pancakeHeight;

        // ------------------------------------------------------------
        // Ground shadow
        // ------------------------------------------------------------

        g.beginFill(0x000000, 0.14);

        g.drawEllipse(
            0,
            height * 0.45,
            width / 2 + 3,
            4
        );

        g.endFill();

        // ------------------------------------------------------------
        // Pancake outer body
        // ------------------------------------------------------------

        const gradient = new PIXI.FillGradient(
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

        g.beginFill(gradient);

        g.drawRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            7
        );

        g.endFill();

        // ------------------------------------------------------------
        // Pancake edge
        // ------------------------------------------------------------

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
            7
        );

        // ------------------------------------------------------------
        // Pancake highlights
        // ------------------------------------------------------------

        g.beginFill(0xffffff, 0.16);

        g.drawRoundedRect(
            -width / 2 + 5,
            -height / 2 + 2,
            width - 10,
            3,
            2
        );

        g.endFill();

        // ------------------------------------------------------------
        // Brown cooking spots
        // ------------------------------------------------------------

        g.beginFill(0xb97832, 0.25);

        g.drawCircle(-18, -2, 2);
        g.drawCircle(8, 1, 2);
        g.drawCircle(21, -2, 1.5);
        g.drawCircle(-4, -1, 1.5);

        g.endFill();

        // ------------------------------------------------------------
        // Butter pat
        // ------------------------------------------------------------

        const normalizedAngle =
            Math.abs(
                ((this.body ? this.body.angle : 0) + Math.PI) %
                    (Math.PI * 2) -
                    Math.PI
            );

        const roughlyFlat =
            normalizedAngle < 0.3;

        if (roughlyFlat) {
            g.beginFill(CONFIG.colors.butter);

            g.drawRoundedRect(
                -10,
                -9,
                20,
                10,
                2
            );

            g.endFill();

            g.beginFill(CONFIG.colors.butterShadow);

            g.drawRect(
                -10,
                -1,
                20,
                2
            );

            g.endFill();

            g.beginFill(0xffffff, 0.4);

            g.drawRect(
                -7,
                -7,
                7,
                2
            );

            g.endFill();
        }

        // ------------------------------------------------------------
        // Face
        // ------------------------------------------------------------

        if (Game.state !== 'playing') {
            return;
        }

        // Eyes.
        g.beginFill(0x333333);

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

        // Eye highlights.
        g.beginFill(0xffffff);

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

        // Cheeks.
        g.beginFill(0xff9696, 0.38);

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

        // Mouth.
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
            g.moveTo(-5, 4);
            g.lineTo(5, 4);
        }

        g.stroke();
    },

    updateGraphics() {
        if (!this.body || !this.graphics) {
            return;
        }

        this.graphics.x = this.body.position.x;
        this.graphics.y = this.body.position.y;
        this.graphics.rotation = this.body.angle;

        // Redraw only when the visual state can change.
        this.drawPancakeGraphics();
    },

    flip(power) {
        if (!this.body) {
            return false;
        }

        if (!this.canFlipAgain) {
            return false;
        }

        if (!this.canFlip()) {
            return false;
        }

        const normalizedPower = Math.max(
            0,
            Math.min(
                1,
                (power || 5) / CONFIG.maxFlipPower
            )
        );

        Matter.Sleeping.set(
            this.body,
            false
        );

        // ------------------------------------------------------------
        // Calculate movement.
        // ------------------------------------------------------------

        const upwardVelocity =
            -(5 + normalizedPower * 15);

        const forwardVelocity =
            3 + normalizedPower * 8;

        Matter.Body.setVelocity(
            this.body,
            {
                x: forwardVelocity,
                y: upwardVelocity
            }
        );

        // ------------------------------------------------------------
        // Calculate rotation.
        // ------------------------------------------------------------

        const angularVelocity =
            0.05 + normalizedPower * 0.3;

        Matter.Body.setAngularVelocity(
            this.body,
            angularVelocity
        );

        // ------------------------------------------------------------
        // State.
        // ------------------------------------------------------------

        this.body.frictionAir =
            CONFIG.airFriction;

        this.isResting = false;
        this.hasFlipped = true;
        this.canFlipAgain = false;
        this.lastFlipTime = Date.now();
        this.contactCount = 0;
        this.lastSurface = null;
        this.landingHandled = false;

        this.flipCount++;

        // Clear old trail.
        this.trailPositions = [];

        // Flip particles.
        Particles.createFlip(
            this.body.position.x,
            this.body.position.y
        );

        // Prevent repeated instant flips.
        setTimeout(() => {
            this.canFlipAgain = true;
        }, 500);

        this.drawPancakeGraphics();

        return true;
    },

    canFlip() {
        if (!this.body) {
            return false;
        }

        if (Game.state !== 'playing') {
            return false;
        }

        if (!this.canFlipAgain) {
            return false;
        }

        // A pancake can be flipped while resting on a valid surface.
        if (this.isResting) {
            return true;
        }

        // It can also be flipped during a short contact window.
        return this.contactCount > 0;
    },

    isPancake(body) {
        return body &&
            body.label === 'pancake';
    },

    isInAir() {
        if (!this.body) {
            return false;
        }

        return (
            Math.abs(this.body.velocity.y) > 0.5 ||
            Math.abs(this.body.velocity.x) > 0.5
        );
    },

    handleCollision(otherBody) {
        if (!this.body || !otherBody) {
            return;
        }

        const validSurfaces = [
            'counter',
            'griddle',
            'plate',
            'butter'
        ];

        if (!validSurfaces.includes(otherBody.label)) {
            return;
        }

        this.contactCount++;

        this.lastSurface = otherBody;

        const velocityX = this.body.velocity.x;
        const velocityY = this.body.velocity.y;

        const speed = Math.sqrt(
            velocityX * velocityX +
            velocityY * velocityY
        );

        // Only treat the pancake as landed when:
        // 1. It was actually flipped.
        // 2. Its movement has slowed sufficiently.
        // 3. We haven't already processed this landing.
        if (
            this.hasFlipped &&
            !this.landingHandled &&
            speed < 3
        ) {
            this.land(otherBody);
        }
    },

    land(surface) {
        if (!this.body) {
            return;
        }

        if (this.landingHandled) {
            return;
        }

        this.landingHandled = true;

        this.isResting = true;
        this.hasFlipped = false;
        this.lastSurface = surface;

        this.body.frictionAir = 0.01;

        Matter.Body.setVelocity(
            this.body,
            {
                x: this.body.velocity.x * 0.15,
                y: 0
            }
        );

        Matter.Body.setAngularVelocity(
            this.body,
            0
        );

        // Slightly straighten the pancake when it lands.
        const angle =
            this.body.angle % (Math.PI * 2);

        let targetAngle = 0;

        if (
            Math.abs(
                Math.abs(angle) - Math.PI
            ) < 0.35
        ) {
            targetAngle = Math.PI;
        }

        Matter.Body.setAngle(
            this.body,
            targetAngle
        );

        Particles.createLanding(
            this.body.position.x,
            this.body.position.y
        );

        // ------------------------------------------------------------
        // Plate = win.
        // ------------------------------------------------------------

        if (surface.label === 'plate') {
            Game.win();
        }

        // ------------------------------------------------------------
        // Normal surfaces.
        // ------------------------------------------------------------

        else if (
            surface.label === 'counter' ||
            surface.label === 'griddle'
        ) {
            UI.showMessage(
                'Nice! Flip again! 🥞'
            );

            // Allow another flip after landing.
            this.canFlipAgain = true;
        }

        // ------------------------------------------------------------
        // Butter = bounce.
        // ------------------------------------------------------------

        else if (surface.label === 'butter') {
            const bounceX =
                this.body.velocity.x * 1.35;

            const bounceY =
                -Math.max(
                    4,
                    Math.abs(this.body.velocity.y) *
                    CONFIG.butterRestitution
                );

            Matter.Body.setVelocity(
                this.body,
                {
                    x: bounceX,
                    y: bounceY
                }
            );

            this.isResting = false;
            this.hasFlipped = true;
            this.landingHandled = false;

            UI.showMessage(
                'Boing! 🧈'
            );
        }

        this.drawPancakeGraphics();
    },

    checkFell() {
        if (!this.body) {
            return false;
        }

        if (
            this.body.position.y >
            CONFIG.canvasHeight + 100
        ) {
            Game.lose();
            return true;
        }

        return false;
    },

    updateTrail() {
        if (
            this.hasFlipped &&
            this.body
        ) {
            this.trailPositions.push({
                x: this.body.position.x,
                y: this.body.position.y,
                life: 1
            });
        }

        // Limit trail size.
        if (this.trailPositions.length > 40) {
            this.trailPositions.shift();
        }

        for (
            let i = this.trailPositions.length - 1;
            i >= 0;
            i--
        ) {
            const trail =
                this.trailPositions[i];

            trail.life -= 0.035;
            trail.y += 0.35;

            if (trail.life <= 0) {
                this.trailPositions.splice(i, 1);
            }
        }
    }
};

window.Pancake = Pancake;