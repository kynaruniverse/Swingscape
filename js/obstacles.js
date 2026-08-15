// ============================================================
// PANCAKE PLOP! — OBSTACLES
// Matter.js physics bodies only
// ============================================================
//
// Architecture split (audit step 2):
//
//   Physics-owned state  → Matter bodies          (this file)
//   Visual state          → Pixi Graphics          (ObstaclesPresentation)
//
// This file owns no PIXI objects and makes no drawing calls.
// All visual representation lives in ObstaclesPresentation
// (js/obstacles-presentation.js), which reads this object's
// public `items` array every frame.
//
// ObstaclesPresentation.init() must run AFTER Obstacles.init(),
// since it reads each body's starting position/angle immediately.
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
         * Build the level geometry.
         */

        this.createCounters();
        this.createGriddle();
        this.createPlate();
        this.createButterPads();
        this.createSyrupBottle();
        this.createBowl();

        console.log(
            'Obstacles initialized:',
            this.items.length
        );
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
                CONFIG.obstacles.counter.y,
                CONFIG.canvasWidth,
                20,
                {
                    isStatic: true,

                    friction:
                        CONFIG.physics.groundFriction,

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
                CONFIG.pancake.start.x,
                CONFIG.obstacles.counter.y - 15,
                90,
                12,
                {
                    isStatic: true,

                    friction:
                        CONFIG.physics.groundFriction,

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
                CONFIG.obstacles.counter.y - 18,
                110,
                10,
                {
                    isStatic: true,

                    friction:
                        CONFIG.physics.groundFriction,

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

        /*
         * Restitution is intentionally hardcoded to 0 here,
         * NOT read from CONFIG.obstacles.butter.restitution.
         *
         * Audit finding: that config value (0.85) was being
         * read for two unrelated purposes — as this Matter
         * body's native restitution, AND as the multiplier in
         * Pancake.land()'s scripted butter-bounce formula. The
         * scripted bounce in land() is what actually produces
         * the visible bounce (it overwrites velocity outright);
         * Matter's own restitution-based collision response ran
         * first, every physics step the pancake was in contact,
         * and was simply clobbered a moment later — except for
         * the one physics step where contact begins, where it
         * briefly contributed a real (and undesired) elastic
         * response before land() got a chance to override it.
         *
         * Setting native restitution to 0 removes that
         * conflicting first-step response. CONFIG.obstacles.
         * butter.restitution remains in use — purely as the
         * scripted-bounce coefficient in Pancake.land().
         *
         * Note Matter.js combines two bodies' restitution via
         * Math.max(bodyA, bodyB), so the *effective* pair
         * restitution is max(0, pancake.restitution) =
         * CONFIG.pancake.restitution (0.12), not exactly 0 —
         * true zero native bounce isn't achievable without also
         * changing the pancake body, which is out of scope here.
         * 0.12 is a mild, one-step-only nudge rather than the
         * previous 0.85's aggressive one.
         */

        const butter1 =
            Physics.createCircle(
                CONFIG.canvasWidth / 2,
                CONFIG.obstacles.counter.y - 70,
                28,
                {
                    isStatic: true,

                    restitution: 0,

                    friction:
                        CONFIG.obstacles.butter.friction,

                    label: 'butter'
                }
            );

        const butter2 =
            Physics.createCircle(
                CONFIG.canvasWidth / 2 + 80,
                CONFIG.obstacles.counter.y - 140,
                22,
                {
                    isStatic: true,

                    restitution: 0,

                    friction:
                        CONFIG.obstacles.butter.friction,

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
                CONFIG.obstacles.counter.y - 35,
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
                CONFIG.obstacles.counter.y - 20,
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
    // RESET
    // --------------------------------------------------------

    clear() {

        this.items.forEach(body => {

            if (body && Physics.world) {
                Physics.removeBody(body);
            }

        });

        this.items = [];
    }
};

window.Obstacles = Obstacles;
