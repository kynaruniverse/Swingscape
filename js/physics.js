// ============================================================
// PANCAKE PLOP!   PHYSICS ENGINE
// Deterministic fixed-timestep Matter.js simulation
// ============================================================
const Physics = {
    engine: null,
    world: null,
    contactPairs: new Set(),

    init() {
        if (this.engine) this.destroy();
        this.engine = Matter.Engine.create({ enableSleeping: false });
        this.engine.gravity.x = CONFIG.physics.gravity.x;
        this.engine.gravity.y = CONFIG.physics.gravity.y;
        this.engine.gravity.scale = CONFIG.physics.gravity.scale ?? this.engine.gravity.scale;
        this.world = this.engine.world;
        this.contactPairs.clear();
        this.setupCollisionEvents();
    },
    setupCollisionEvents() {
        if (!this.engine) return;
        Matter.Events.on(this.engine, 'collisionStart', event => {
            if (!event || !event.pairs) return;
            event.pairs.forEach(pair => {
                if (!pair || !pair.bodyA || !pair.bodyB) return;
                const contactKey = this.getContactKey(pair.bodyA, pair.bodyB);
                this.contactPairs.add(contactKey);
                
                const pancakeBody = this.getPancakeBody(pair.bodyA, pair.bodyB);
                if (!pancakeBody) return;
                
                const otherBody = pancakeBody === pair.bodyA ? pair.bodyB : pair.bodyA;
                if (!this.isPancakeContactSurface(otherBody)) return;
                
                if (typeof Pancake !== 'undefined' && typeof Pancake.beginContact === 'function') {
                    Pancake.beginContact(otherBody);
                }
            });
        });
        Matter.Events.on(this.engine, 'collisionEnd', event => {
            if (!event || !event.pairs) return;
            event.pairs.forEach(pair => {
                if (!pair || !pair.bodyA || !pair.bodyB) return;
                const contactKey = this.getContactKey(pair.bodyA, pair.bodyB);
                this.contactPairs.delete(contactKey);
                
                const pancakeBody = this.getPancakeBody(pair.bodyA, pair.bodyB);
                if (!pancakeBody) return;
                
                const otherBody = pancakeBody === pair.bodyA ? pair.bodyB : pair.bodyA;
                if (!this.isPancakeContactSurface(otherBody)) return;
                
                if (typeof Pancake !== 'undefined' && typeof Pancake.endContact === 'function') {
                    Pancake.endContact(otherBody);
                }
            });
        });
    },
    update() {
        if (this.engine) this.step();
    },
    step() {
        if (!this.engine) return;
        Matter.Engine.update(this.engine, CONFIG.physics.fixedDeltaMilliseconds);
        this.clampPancakeVelocity();
    },
    clampPancakeVelocity() {
        if (typeof Pancake === 'undefined' || !Pancake.body) return;
        const body = Pancake.body;
        const limits = CONFIG.physics.maxVelocity;
        if (!limits) return;
        const maxX = Math.max(0, Number(limits.x) || 0);
        const maxY = Math.max(0, Number(limits.y) || 0);
        const maxAngular = Math.max(0, Number(limits.angular) || 0);
        
        if (maxX > 0 && Math.abs(body.velocity.x) > maxX) {
            Matter.Body.setVelocity(body, { x: maxX * Math.sign(body.velocity.x), y: body.velocity.y });
        }
        if (maxY > 0 && Math.abs(body.velocity.y) > maxY) {
            Matter.Body.setVelocity(body, { x: body.velocity.x, y: maxY * Math.sign(body.velocity.y) });
        }
        if (maxAngular > 0 && Math.abs(body.angularVelocity) > maxAngular) {
            Matter.Body.setAngularVelocity(body, maxAngular * Math.sign(body.angularVelocity));
        }
    },
    getContactKey(bodyA, bodyB) {
        if (!bodyA || !bodyB) return '';
        return `${Math.min(bodyA.id, bodyB.id)}-${Math.max(bodyA.id, bodyB.id)}`;
    },
    getPancakeBody(bodyA, bodyB) {
        if (typeof Pancake === 'undefined' || typeof Pancake.isPancake !== 'function') return null;
        if (Pancake.isPancake(bodyA)) return bodyA;
        if (Pancake.isPancake(bodyB)) return bodyB;
        return null;
    },
    isPancakeContactSurface(body) {
        if (!body) return false;
        return ['counter', 'griddle', 'plate', 'butter'].includes(body.label);
    },
    createBody(x, y, width, height, options = {}) {
        return Matter.Bodies.rectangle(x, y, width, height, options);
    },
    createCircle(x, y, radius, options = {}) {
        return Matter.Bodies.circle(x, y, radius, options);
    },
    addBody(body) {
        if (this.world && body) Matter.World.add(this.world, body);
    },
    removeBody(body) {
        if (!body) return;
        this.removeBodyContacts(body);
        if (this.world) Matter.World.remove(this.world, body);
    },
    removeBodyContacts(body) {
        if (!body) return;
        const bodyId = body.id;
        for (const contactKey of this.contactPairs) {
            if (contactKey.startsWith(`${bodyId}-`) || contactKey.endsWith(`-${bodyId}`)) {
                this.contactPairs.delete(contactKey);
            }
        }
    },
    clearWorld() {
        if (!this.engine) return;
        Matter.World.clear(this.world, false);
        Matter.Engine.clear(this.engine);
        this.world = this.engine.world;
        this.contactPairs.clear();
    },
    destroy() {
        if (!this.engine) {
            this.contactPairs.clear();
            this.world = null;
            return;
        }
        Matter.Events.off(this.engine);
        if (this.world) Matter.World.clear(this.world, false);
        Matter.Engine.clear(this.engine);
        this.contactPairs.clear();
        this.world = null;
        this.engine = null;
    }
};
window.Physics = Physics;
