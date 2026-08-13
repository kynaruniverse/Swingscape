// ============================================================
// PANCAKE PLOP! — PHYSICS ENGINE
// Deterministic fixed-timestep Matter.js simulation
// ============================================================

const Physics = {

    // --------------------------------------------------------
    // MATTER REFERENCES
    // --------------------------------------------------------

    engine: null,
    world: null,

    // --------------------------------------------------------
    // COLLISION STATE
    // --------------------------------------------------------

    contactPairs: new Set(),

    // --------------------------------------------------------
    // INITIALISE
    // --------------------------------------------------------

    init() {

        const {
            Engine
        } = Matter;

        this.engine = Engine.create({
            enableSleeping: false
        });

        /*
         * Gravity is owned by CONFIG so there is only one
         * authoritative physics configuration.
         */
        this.engine.gravity.x =
            CONFIG.physics.gravity.x;

        this.engine.gravity.y =
            CONFIG.physics.gravity.y;

        this.world =
            this.engine.world;

        this.contactPairs.clear();

        this.setupCollisionEvents();

        console.log(
            'Physics initialized:',
            `${CONFIG.physics.fixedDeltaMilliseconds.toFixed(2)}ms fixed timestep`
        );
    },

    // --------------------------------------------------------
    // COLLISION EVENTS
    // --------------------------------------------------------

    setupCollisionEvents() {

        const {
            Events
        } = Matter;

        /*
         * Collision start.
         *
         * This is the moment two bodies begin touching.
         */
        Events.on(
            this.engine,
            'collisionStart',
            event => {

                event.pairs.forEach(pair => {

                    const bodyA =
                        pair.bodyA;

                    const bodyB =
                        pair.bodyB;

                    const contactKey =
                        this.getContactKey(
                            bodyA,
                            bodyB
                        );

                    this.contactPairs.add(
                        contactKey
                    );

                    /*
                     * Forward pancake collisions to the
                     * pancake gameplay system.
                     */
                    const pancakeBody =
                        this.getPancakeBody(
                            bodyA,
                            bodyB
                        );

                    if (!pancakeBody) {
                        return;
                    }

                    const otherBody =
                        pancakeBody === bodyA
                            ? bodyB
                            : bodyA;

                    /*
                     * Let Pancake manage its own grounded
                     * state and contact surface tracking.
                     */
                    if (
                        typeof Pancake !== 'undefined' &&
                        typeof Pancake.beginContact === 'function'
                    ) {

                        Pancake.beginContact(
                            otherBody
                        );
                    }

                    /*
                     * Optional gameplay hook.
                     */
                    if (
                        typeof Pancake !== 'undefined' &&
                        typeof Pancake.handleCollision === 'function'
                    ) {

                        Pancake.handleCollision(
                            otherBody
                        );
                    }
                });
            }
        );

        /*
         * Collision end.
         *
         * Remove the contact from the active contact pairs
         * and let Pancake update its grounded state.
         */
        Events.on(
            this.engine,
            'collisionEnd',
            event => {

                event.pairs.forEach(pair => {

                    const bodyA =
                        pair.bodyA;

                    const bodyB =
                        pair.bodyB;

                    const contactKey =
                        this.getContactKey(
                            bodyA,
                            bodyB
                        );

                    this.contactPairs.delete(
                        contactKey
                    );

                    const pancakeBody =
                        this.getPancakeBody(
                            bodyA,
                            bodyB
                        );

                    if (!pancakeBody) {
                        return;
                    }

                    const otherBody =
                        pancakeBody === bodyA
                            ? bodyB
                            : bodyA;

                    if (
                        typeof Pancake !== 'undefined' &&
                        typeof Pancake.endContact === 'function'
                    ) {

                        Pancake.endContact(
                            otherBody
                        );
                    }
                });
            }
        );
    },

    // --------------------------------------------------------
    // FIXED-STEP UPDATE
    // --------------------------------------------------------

    update() {

        if (!this.engine) {
            return;
        }

        /*
         * Physics always advances by exactly one fixed step.
         *
         * Game.fixedUpdate() is responsible for calling this
         * at the deterministic 60 Hz interval.
         */
        this.step();
    },

    // --------------------------------------------------------
    // SINGLE DETERMINISTIC PHYSICS STEP
    // --------------------------------------------------------

    step() {
    
        if (!this.engine) {
            return;
        }
    
        Matter.Engine.update(
            this.engine,
            CONFIG.physics.fixedDeltaMilliseconds
        );
    
        /*
         * Clamp pancake velocities to prevent numerical instability.
         */
        const pancake = Pancake.body;
        if (pancake) {
            const maxX = CONFIG.physics.maxVelocity.x;
            const maxY = CONFIG.physics.maxVelocity.y;
            const maxAng = CONFIG.physics.maxVelocity.angular;
            const vx = pancake.velocity.x;
            const vy = pancake.velocity.y;
            if (Math.abs(vx) > maxX) {
                pancake.velocity.x = maxX * Math.sign(vx);
            }
            if (Math.abs(vy) > maxY) {
                pancake.velocity.y = maxY * Math.sign(vy);
            }
            const ang = pancake.angularVelocity;
            if (Math.abs(ang) > maxAng) {
                pancake.angularVelocity = maxAng * Math.sign(ang);
            }
        }
    },


    // --------------------------------------------------------
    // COLLISION HELPERS
    // --------------------------------------------------------

    getContactKey(bodyA, bodyB) {

        const first =
            Math.min(
                bodyA.id,
                bodyB.id
            );

        const second =
            Math.max(
                bodyA.id,
                bodyB.id
            );

        return `${first}-${second}`;
    },

    getPancakeBody(bodyA, bodyB) {

        if (
            typeof Pancake === 'undefined' ||
            typeof Pancake.isPancake !== 'function'
        ) {
            return null;
        }

        if (
            Pancake.isPancake(bodyA)
        ) {
            return bodyA;
        }

        if (
            Pancake.isPancake(bodyB)
        ) {
            return bodyB;
        }

        return null;
    },

    isPancakeContactSurface(body) {

        return [
            'counter',
            'griddle',
            'plate',
            'butter'
        ].includes(
            body.label
        );
    },

    // --------------------------------------------------------
    // BODY CREATION
    // --------------------------------------------------------

    createBody(
        x,
        y,
        width,
        height,
        options = {}
    ) {

        return Matter.Bodies.rectangle(
            x,
            y,
            width,
            height,
            options
        );
    },

    createCircle(
        x,
        y,
        radius,
        options = {}
    ) {

        return Matter.Bodies.circle(
            x,
            y,
            radius,
            options
        );
    },

    // --------------------------------------------------------
    // WORLD MANAGEMENT
    // --------------------------------------------------------

    addBody(body) {

        if (
            !this.world ||
            !body
        ) {
            return;
        }

        Matter.World.add(
            this.world,
            body
        );
    },

    removeBody(body) {

        if (
            !this.world ||
            !body
        ) {
            return;
        }

        Matter.World.remove(
            this.world,
            body
        );

        /*
         * Remove any stale contact pairs associated
         * with this body.
         */
        this.removeBodyContacts(
            body
        );
    },

    removeBodyContacts(body) {

        if (!body) {
            return;
        }

        const bodyId =
            body.id;

        /*
         * Remove any pair involving this body.
         */
        for (
            const contactKey of this.contactPairs
        ) {

            if (
                contactKey.startsWith(
                    `${bodyId}-`
                ) ||
                contactKey.endsWith(
                    `-${bodyId}`
                )
            ) {

                this.contactPairs.delete(
                    contactKey
                );
            }
        }

        /*
         * Pancake state is not directly reset here.
         *
         * Game.reset() will rebuild Pancake and clear its
         * contact surfaces via Pancake.init().
         */
    },

    // --------------------------------------------------------
    // CLEAR WORLD
    // --------------------------------------------------------

    clearWorld() {

        if (!this.engine) {
            return;
        }

        Matter.World.clear(
            this.world,
            false
        );

        Matter.Engine.clear(
            this.engine
        );

        this.contactPairs.clear();

        /*
         * Pancake contact state is rebuilt by Pancake.init().
         */
    }
};

window.Physics = Physics;