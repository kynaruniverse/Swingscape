// ============================================================
// PANCAKE PLOP! — PANCAKE GAMEPLAY STATE
// Matter.js body + gameplay state only
// ============================================================
//
// Architecture split (audit step 1):
//
//   Physics-owned state  → Matter body            (this file)
//   Gameplay state       → flip, landing, grounded (this file)
//   Visual state          → Pixi Graphics          (PancakePresentation)
//
// This file owns no PIXI objects and makes no drawing calls.
// All visual representation lives in PancakePresentation
// (js/pancake-presentation.js), which reads this object's
// public state (body, isResting, isGrounded, ...) every frame.
//
// Pancake.fixedUpdate() runs only during Game.fixedUpdate().
// PancakePresentation.renderUpdate() runs during Game.renderUpdate().
// ============================================================

const Pancake = {

    // --------------------------------------------------------
    // PHYSICS
    // --------------------------------------------------------

    body: null,

    /*
     * Render-interpolation snapshot. Seeded in init(); kept in
     * sync by snapshotPreviousState() (called from Physics.step()
     * before each Matter step) and by syncPreviousState() (called
     * after any teleport-like Matter.Body.setPosition/setAngle
     * outside normal integration, so interpolation never lerps
     * across an intentional jump). See PancakePresentation.
     * updateGraphics() for where this is consumed.
     */
    previousPosition: { x: 0, y: 0 },
    previousAngle: 0,

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

    /*
     * The single most recent contact body (any surface).
     * Informational only — checkLanding() now resolves the
     * correct landing surface from contactSurfaces' per-surface
     * timestamps (see below), not from this field. Kept as a
     * cheap "what did the pancake most recently touch" hook for
     * future presentation code (camera/audio/VFX).
     */
    lastSurface: null,

    /*
     * Physics owns the actual collision events.
     *
     * Maps surface label -> { body, time } for every surface
     * currently touching the pancake. A Map (rather than the
     * previous Set<label>) lets us determine which surface was
     * MOST RECENTLY contacted when several are touching at once
     * (audit finding: previously fell back to whichever label
     * happened to be first in Set iteration order, which is not
     * necessarily the most recent contact, and lost the real
     * body reference — e.g. no surface.position for butter).
     */
    contactSurfaces: new Map(),

    ignoreButterUntil: 0,

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

        /*
         * Interpolation snapshot (audit fix — render position
         * used to equal the latest physics step exactly, with
         * no smoothing between steps; see PancakePresentation.
         * updateGraphics() for where this is consumed).
         *
         * Seeded to the body's starting transform so the very
         * first render (before any physics step has run) has a
         * valid, non-stale previous state to interpolate from.
         */

        this.previousPosition = {
            x: this.body.position.x,
            y: this.body.position.y
        };

        this.previousAngle =
            this.body.angle;

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

        /*
         * The pancake starts resting on the counter. Obstacles
         * is initialised before Pancake (see game.js), so the
         * real counter body is available here.
         */

        const counterBody =
            (typeof Obstacles !== 'undefined' && Obstacles.items)
                ? Obstacles.items.find(
                    item => item.label === 'counter'
                )
                : null;

        this.contactSurfaces.set(
            'counter',
            {
                body: counterBody || null,
                time: performance.now()
            }
        );

        this.ignoreButterUntil = 0;

        // ----------------------------------------------------
        // ADD TO PHYSICS WORLD
        // ----------------------------------------------------

        Physics.addBody(
            this.body
        );

        console.log(
            'Pancake initialized:',
            this.body.position.x,
            this.body.position.y
        );
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

        // Track flips in game
        if (typeof Game !== 'undefined') {
            Game.flipsInLevel++;
            UI.showControlsHint(Game.flipsInLevel);
        }

        // ----------------------------------------------------
        // PRESENTATION EVENT
        //
        // Sound, particles, and hiding the danger-zone graphic
        // are all presentation reactions to this physics event.
        // Rather than calling those systems directly, Pancake
        // emits 'launch' and lets whichever presentation systems
        // are subscribed (AudioManager, Particles,
        // PancakePresentation) decide how to react.
        // ----------------------------------------------------

        if (typeof PresentationEvents !== 'undefined') {
            PresentationEvents.emit('launch', {
                x: this.body.position.x,
                y: this.body.position.y
            });
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
    // RENDER-INTERPOLATION SNAPSHOTS
    // --------------------------------------------------------

    /*
     * Called by Physics.step(), once per fixed physics step,
     * immediately BEFORE Matter.Engine.update() advances the
     * body. Captures "where the pancake was" so the renderer can
     * later interpolate between this and "where it is now".
     */
    snapshotPreviousState() {

        if (!this.body) {
            return;
        }

        this.previousPosition.x =
            this.body.position.x;

        this.previousPosition.y =
            this.body.position.y;

        this.previousAngle =
            this.body.angle;
    },

    /*
     * Called immediately after any direct Matter.Body.
     * setPosition()/setAngle() teleport that happens OUTSIDE
     * normal physics integration — landing's angle snap, the
     * butter-bounce separation teleport, and the horizontal
     * screen-wrap. Collapses previous == current for that one
     * step so the renderer doesn't interpolate across the jump
     * (which would look like the pancake sliding/spinning
     * through empty space for one frame).
     */
    syncPreviousState() {

        if (!this.body) {
            return;
        }

        this.previousPosition.x =
            this.body.position.x;

        this.previousPosition.y =
            this.body.position.y;

        this.previousAngle =
            this.body.angle;
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
    
        // Ignore butter contacts during the bounce cooldown period.
        if (
            otherBody.label === 'butter' &&
            this.ignoreButterUntil > performance.now()
        ) {
            return;
        }
    
        this.contactSurfaces.set(
            otherBody.label,
            {
                body: otherBody,
                time: performance.now()
            }
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
    // HORIZONTAL WRAP
    // --------------------------------------------------------

    wrapHorizontal() {

        if (!this.body) {
            return;
        }

        const halfWidth =
            CONFIG.pancake.width / 2;

        const leftBound =
            -halfWidth;

        const rightBound =
            CONFIG.canvasWidth + halfWidth;

        if (
            this.body.position.x < leftBound
        ) {

            const newX =
                CONFIG.canvasWidth + halfWidth;

            /*
             * Update positionPrev to prevent Matter from
             * interpreting the teleport as a huge velocity.
             */
            this.body.positionPrev.x =
                newX;

            Matter.Body.setPosition(
                this.body,
                {
                    x: newX,
                    y: this.body.position.y
                }
            );

            /*
             * Clear trail to avoid a line across the screen.
             */
            this.trailPositions = [];

            /*
             * Don't let the renderer interpolate across the
             * screen (this is a teleport, not real movement).
             */
            this.syncPreviousState();

        } else if (
            this.body.position.x > rightBound
        ) {

            const newX =
                -halfWidth;

            this.body.positionPrev.x =
                newX;

            Matter.Body.setPosition(
                this.body,
                {
                    x: newX,
                    y: this.body.position.y
                }
            );

            this.trailPositions = [];

            this.syncPreviousState();
        }
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
        // HORIZONTAL WRAP
        // ----------------------------------------------------

        this.wrapHorizontal();

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
         * Find the most recently contacted surface that is
         * still touching, using real contact timestamps rather
         * than Set/Map iteration order (audit fix — iteration
         * order is insertion order, not recency, so the old
         * fallback could pick an arbitrary touching surface
         * when several were touching simultaneously, and it
         * only carried a label with no real body/position).
         */

        let surface = null;

        let mostRecentTime = -Infinity;

        for (
            const [label, entry] of this.contactSurfaces
        ) {

            if (entry.time > mostRecentTime) {

                mostRecentTime = entry.time;

                /*
                 * Prefer the real body (gives land() access to
                 * surface.position, e.g. for the butter bounce
                 * direction). Fall back to a label-only object
                 * in the unlikely case no body was recorded.
                 */

                surface =
                    entry.body ||
                    { label };
            }
        }

        if (!surface) {
            return;
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

        /*
         * Don't let the renderer interpolate across this snap
         * (it's a discrete correction, not continuous motion).
         */
        this.syncPreviousState();

        // ----------------------------------------------------
        // PRESENTATION EVENT
        //
        // Landing particles fire unconditionally; landing sound
        // and the contextual UI message are surface-dependent.
        // Rather than branching on surface.label here, Pancake
        // emits 'land' with the surface label in the payload and
        // lets each subscribed presentation system (Particles,
        // AudioManager, UI) decide for itself whether/how to
        // react — see their respective 'land' subscriptions.
        // ----------------------------------------------------

        if (typeof PresentationEvents !== 'undefined') {
            PresentationEvents.emit('land', {
                x: this.body.position.x,
                y: this.body.position.y,
                surfaceLabel: surface.label
            });
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

        /*
         * Determine a guaranteed horizontal direction.
         *
         * If the pancake is left of the butter centre, bounce left.
         * If it is right of the butter centre, bounce right.
         *
         * This prevents a straight vertical bounce from trapping
         * the pancake on top of the butter forever.
         */

                const butterX =
                    surface.position
                        ? surface.position.x
                        : this.body.position.x;

                const direction =
                    this.body.position.x <= butterX
                        ? -1
                        : 1;

                const minHorizontal =
                    CONFIG.obstacles.butter.minimumHorizontalBounceVelocity;

                let bounceX =
                    this.body.velocity.x *
                    CONFIG.obstacles.butter.bounceVelocityMultiplier;

                if (
                    Math.abs(bounceX) <
                    minHorizontal
                ) {

                    bounceX =
                        direction *
                        minHorizontal;
                }

                const bounceY =
                    -Math.max(
                        CONFIG.obstacles.butter.minimumBounceVelocity,

                        /*
                         * CONFIG.obstacles.butter.restitution is
                         * now used ONLY here — as the scripted-
                         * bounce coefficient — not as the Matter
                         * body's native restitution (which is
                         * hardcoded to 0 in Obstacles.
                         * createButterPads(); see the comment
                         * there for why).
                         */
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

                // Separate the pancake from the butter to avoid immediate re-contact.
                const butterPos = surface.position ? surface.position : { x: this.body.position.x, y: this.body.position.y };
                const sepX = direction * 8;
                const sepY = -15; // upward
                Matter.Body.setPosition(this.body, {
                    x: this.body.position.x + sepX,
                    y: this.body.position.y + sepY
                });

                /*
                 * Another teleport in the same land() call (the
                 * angle-snap sync above already ran) — re-sync so
                 * the renderer doesn't interpolate across this
                 * separation jump either.
                 */
                this.syncPreviousState();

                // Ignore butter collisions for a short time to prevent bounce loops.
                this.ignoreButterUntil = performance.now() + 200;

                this.isResting =
                    false;

                this.isGrounded =
                    false;

                this.hasFlipped =
                    true;

                this.landingHandled =
                    false;

                this.contactSurfaces.clear();

                /*
                 * 'Boing!' message now handled by UI's 'land'
                 * subscription (see ui.js).
                 */

                return;
            }

        // ----------------------------------------------------
        // NORMAL SURFACES
        // ----------------------------------------------------

        if (
            surface.label === 'counter' ||
            surface.label === 'griddle'
        ) {

            this.flipCooldown = 0;
            this.canFlipAgain =
                true;

            /*
             * 'Nice! Flip again!' message now handled by UI's
             * 'land' subscription (see ui.js).
             */
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
