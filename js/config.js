// ============================================================
// PANCAKE PLOP! — GLOBAL GAME CONFIGURATION
// ============================================================
//
// SINGLE SOURCE OF TRUTH
//
// Canonical values live in namespaced categories:
//
//   CONFIG.physics
//   CONFIG.pancake
//   CONFIG.gameplay
//   CONFIG.obstacles
//   CONFIG.colors
//   CONFIG.input
//
// Legacy top-level names are still available as read-only
// getters to avoid breaking existing files during migration.
// New code should use the namespaced categories directly.
// ============================================================

const CONFIG = {

    // ========================================================
    // LOGICAL GAME SPACE
    // ========================================================

    canvasWidth: 420,

    canvasHeight: 750,


    // ========================================================
    // DETERMINISTIC SIMULATION
    // ========================================================

    physics: {

        hz: 60,

        /*
         * Physics always advances at exactly 60 Hz.
         *
         * 1 / 60 second = 16.666... ms
         */

        fixedDeltaTime: 1 / 60,

        fixedDeltaMilliseconds: 1000 / 60,

        /*
         * Prevent a long frame from causing an enormous number
         * of physics updates.
         */

        maxFrameDelta: 0.1,

        maxPhysicsStepsPerFrame: 6,

        gravity: {
            x: 0,
            y: 0.55
        },

        /*
         * Matter's air friction value.
         *
         * Deliberately small because the pancake should retain
         * useful horizontal momentum during a flip.
         */

        airFriction: 0.012,

        /*
         * Default surface friction.
         */

        groundFriction: 0.6,

        /*
         * Default surface restitution.
         */

        groundRestitution: 0.15,

        /*
         * Maximum useful velocity.
         *
         * Safety limits rather than normal gameplay limits.
         * They prevent numerical explosions.
         */

        maxVelocity: {
            x: 25,
            y: 30,
            angular: 0.6
        }
    },


    // ========================================================
    // PANCAKE
    // ========================================================

    pancake: {

        width: 56,

        height: 14,

        cornerRadius: 7,

        density: 0.001,

        friction: 0.45,

        restitution: 0.12,

        frictionAir: 0.01,

        start: {

            x: 90,

            /*
             * The pancake starts immediately above the griddle.
             *
             * Expressed relative to the griddle rather than as
             * an unrelated magic Y coordinate.
             */

            yOffset: -25
        }
    },


    // ========================================================
    // GAMEPLAY
    // ========================================================

    gameplay: {

        flip: {

            /*
             * Player charge is represented on a 0–20 scale.
             */

            maxPower: 20,

            /*
             * Power gained per 60 Hz simulation frame.
             *
             * 0.15 × 60 = 9 power/second.
             *
             * A completely empty charge therefore takes about
             * 2.22 seconds to reach maximum power.
             */

            chargeRate: 0.15,

            /*
             * Minimum charge required for a valid flip.
             *
             * Prevents accidental microscopic taps from producing
             * meaningless movement.
             */

            minPower: 0.25,

            /*
             * Horizontal launch velocity.
             */

            forwardVelocityMin: 3,

            forwardVelocityMax: 11,

            /*
             * Vertical launch velocity.
             *
             * Negative Y means upward in the game coordinate
             * system.
             */

            upwardVelocityMin: 5,

            upwardVelocityMax: 20,

            /*
             * Angular launch velocity.
             */

            angularVelocityMin: 0.05,

            angularVelocityMax: 0.35,

            /*
             * Prevent immediate re-flipping after launch.
             */

            cooldown: 0.5
        },

        landing: {

            /*
             * Maximum total speed at which a collision can be
             * considered a normal landing.
             */

            maxSpeed: 3,

            /*
             * Maximum angular velocity considered settled.
             */

            maxAngularVelocity: 0.12,

            /*
             * Once contact has remained stable for this duration,
             * the pancake is considered properly resting.
             */

            settleTime: 0.08,

            /*
             * Small velocity threshold used to determine whether
             * the pancake is effectively stationary.
             */

            restingVelocityThreshold: 0.5,

            /*
             * Angle tolerance used when deciding whether a pancake
             * should settle face-up or face-down.
             */

            angleTolerance: 0.35
        },

        fall: {

            /*
             * How far below the counter the pancake can travel
             * before being considered fallen.
             */

            margin: 100
        }
    },


    // ========================================================
    // KITCHEN / OBSTACLES
    // ========================================================

    obstacles: {

        counter: {

            y: 630,

            height: 20,

            radius: 5,

            friction: 0.6,

            restitution: 0.15,

            sections: [

                {
                    x: 130,
                    width: 160
                },

                {
                    x: 300,
                    width: 160
                }
            ]
        },

        griddle: {

            x: 90,

            width: 90,

            height: 12,

            yOffset: -15,

            radius: 3,

            friction: 0.4,

            restitution: 0.15
        },

        plate: {

            xOffsetFromRight: 75,

            width: 110,

            height: 10,

            yOffset: -18,

            radius: 5,

            friction: 0.5,

            restitution: 0.05
        },

        butter: {

            first: {

                xOffset: 0,

                yOffset: -70,

                radius: 28
            },

            second: {

                xOffset: 80,

                yOffset: -140,

                radius: 22
            },

            restitution: 0.85,

            friction: 0.08,

            bounceVelocityMultiplier: 1.35,

            minimumBounceVelocity: 4,
            minimumHorizontalBounceVelocity: 3.5
        },

        syrup: {

            xOffsetFromRight: 170,

            yOffset: -35,

            width: 28,

            height: 50,

            radius: 4,

            friction: 0.2,

            restitution: 0.05
        },

        bowl: {

            xOffsetFromRight: 190,

            yOffset: -20,

            width: 55,

            height: 25,

            radius: 8,

            friction: 0.3,

            restitution: 0.05
        }
    },


    // ========================================================
    // INPUT
    // ========================================================

    input: {

        /*
         * Touch and mouse share the same logical input path.
         * Future tuning values belong here.
         */

        mouseEnabled: true,

        touchEnabled: true
    },


    // ========================================================
    // PARTICLES
    // ========================================================

    particles: {

        maxParticles: 300,

        /*
         * Particle simulation uses the same fixed timestep
         * as the main game.
         */

        gravity: 0.3,

        defaultLife: 1,

        defaultFadeSpeed: 0.02,

        maxFlipParticles: 20,

        maxLandingParticles: 30,

        maxWinParticles: 100
    },


    // ========================================================
    // AMBIENT ENVIRONMENT
    // ========================================================

    dust: {

        count: 10,

        minRadius: 1,

        maxRadius: 2.5,

        minSpeed: 0.25,

        maxSpeed: 0.7,

        minAmplitudeX: 8,

        maxAmplitudeX: 23,

        minAmplitudeY: 5,

        maxAmplitudeY: 15
    },


    // ========================================================
    // VISUAL COLOURS
    // ========================================================

    colors: {

        background: 0xfef3e2,

        backgroundDark: 0xfae5c8,

        wall: 0xf5e6d3,

        wallTile: 0xfff5e8,

        counter: 0xc4956a,

        counterTop: 0xd4a574,

        counterSide: 0xa87b52,

        pancake: 0xe8a860,

        pancakeDark: 0xd4903b,

        pancakeLight: 0xf0c080,

        butter: 0xffe066,

        butterShadow: 0xf0c040,

        plate: 0xffffff,

        plateShadow: 0xe0d0c0,

        syrup: 0x8b4513,

        syrupDark: 0x6b3008,

        griddle: 0x555555,

        griddleHot: 0xff5522,

        text: 0x5c3a1e,

        window: 0xaed4f0,

        windowFrame: 0xf5e6d3
    }
};


// ========================================================
// LEGACY COMPATIBILITY GETTERS
// ========================================================
//
// Existing files may still use the original top-level names.
// These getters map them to the new canonical namespaced
// values without duplicating mutable state.
// ========================================================

Object.defineProperties(CONFIG, {

    physicsHz: {
        get() { return this.physics.hz; }
    },

    fixedDeltaTime: {
        get() { return this.physics.fixedDeltaTime; }
    },

    fixedDeltaMilliseconds: {
        get() { return this.physics.fixedDeltaMilliseconds; }
    },

    maxFrameDelta: {
        get() { return this.physics.maxFrameDelta; }
    },

    maxPhysicsStepsPerFrame: {
        get() { return this.physics.maxPhysicsStepsPerFrame; }
    },

    gravity: {
        get() { return this.physics.gravity; }
    },

    airFriction: {
        get() { return this.physics.airFriction; }
    },

    groundFriction: {
        get() { return this.physics.groundFriction; }
    },

    groundRestitution: {
        get() { return this.physics.groundRestitution; }
    },

    maxVelocityX: {
        get() { return this.physics.maxVelocity.x; }
    },

    maxVelocityY: {
        get() { return this.physics.maxVelocity.y; }
    },

    maxAngularVelocity: {
        get() { return this.physics.maxVelocity.angular; }
    },

    pancakeWidth: {
        get() { return this.pancake.width; }
    },

    pancakeHeight: {
        get() { return this.pancake.height; }
    },

    pancakeCornerRadius: {
        get() { return this.pancake.cornerRadius; }
    },

    pancakeDensity: {
        get() { return this.pancake.density; }
    },

    pancakeFriction: {
        get() { return this.pancake.friction; }
    },

    pancakeRestitution: {
        get() { return this.pancake.restitution; }
    },

    pancakeFrictionAir: {
        get() { return this.pancake.frictionAir; }
    },

    startX: {
        get() { return this.pancake.start.x; }
    },

    startYOffset: {
        get() { return this.pancake.start.yOffset; }
    },

    maxFlipPower: {
        get() { return this.gameplay.flip.maxPower; }
    },

    flipChargeRate: {
        get() { return this.gameplay.flip.chargeRate; }
    },

    minimumFlipPower: {
        get() { return this.gameplay.flip.minPower; }
    },

    flipForwardVelocityMin: {
        get() { return this.gameplay.flip.forwardVelocityMin; }
    },

    flipForwardVelocityMax: {
        get() { return this.gameplay.flip.forwardVelocityMax; }
    },

    flipUpwardVelocityMin: {
        get() { return this.gameplay.flip.upwardVelocityMin; }
    },

    flipUpwardVelocityMax: {
        get() { return this.gameplay.flip.upwardVelocityMax; }
    },

    flipAngularVelocityMin: {
        get() { return this.gameplay.flip.angularVelocityMin; }
    },

    flipAngularVelocityMax: {
        get() { return this.gameplay.flip.angularVelocityMax; }
    },

    flipCooldown: {
        get() { return this.gameplay.flip.cooldown; }
    },

    landingMaxSpeed: {
        get() { return this.gameplay.landing.maxSpeed; }
    },

    landingMaxAngularVelocity: {
        get() { return this.gameplay.landing.maxAngularVelocity; }
    },

    landingSettleTime: {
        get() { return this.gameplay.landing.settleTime; }
    },

    restingVelocityThreshold: {
        get() { return this.gameplay.landing.restingVelocityThreshold; }
    },

    landingAngleTolerance: {
        get() { return this.gameplay.landing.angleTolerance; }
    },

    fallMargin: {
        get() { return this.gameplay.fall.margin; }
    },

    counterY: {
        get() { return this.obstacles.counter.y; }
    },

    counter: {
        get() { return this.obstacles.counter; }
    },

    griddle: {
        get() { return this.obstacles.griddle; }
    },

    plate: {
        get() { return this.obstacles.plate; }
    },

    butter: {
        get() { return this.obstacles.butter; }
    },

    syrup: {
        get() { return this.obstacles.syrup; }
    },

    bowl: {
        get() { return this.obstacles.bowl; }
    },

    butterRestitution: {
        get() { return this.obstacles.butter.restitution; }
    },

    butterFriction: {
        get() { return this.obstacles.butter.friction; }
    },

    startY: {
        get() {
            return this.obstacles.counter.y +
                this.obstacles.griddle.yOffset +
                this.pancake.start.yOffset;
        }
    },

    fallY: {
        get() {
            return this.canvasHeight +
                this.gameplay.fall.margin;
        }
    },

    physicsDelta: {
        get() { return this.physics.fixedDeltaTime; }
    },

    physicsStepMs: {
        get() { return this.physics.fixedDeltaMilliseconds; }
    },

    chargeRatePerSecond: {
        get() {
            return this.gameplay.flip.chargeRate *
                this.physics.hz;
        }
    }
});


// ============================================================
// GLOBAL EXPORT
// ============================================================

window.CONFIG = CONFIG;