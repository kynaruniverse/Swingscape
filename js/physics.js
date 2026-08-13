// Physics Engine Setup - Better Contact Detection
const Physics = {
    engine: null,
    world: null,
    contactPairs: new Set(),
    
    init() {
        const { Engine, World, Events } = Matter;
        
        this.engine = Engine.create({
            gravity: { x: 0, y: 0.6 },
            enableSleeping: false
        });
        
        this.world = this.engine.world;
        
        // Set up collision events
        this.setupCollisionEvents();
        
        console.log('Physics initialized');
    },
    
    setupCollisionEvents() {
        const { Events } = Matter;
        
        // Track active contacts
        Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;
                
                // Track contact
                const contactKey = bodyA.id + '-' + bodyB.id;
                this.contactPairs.add(contactKey);
                
                // Check if pancake is involved
                if (Pancake.isPancake(bodyA) || Pancake.isPancake(bodyB)) {
                    const pancakeBody = Pancake.isPancake(bodyA) ? bodyA : bodyB;
                    const otherBody = pancakeBody === bodyA ? bodyB : bodyA;
                    
                    Pancake.handleCollision(otherBody);
                }
            });
        });
        
        Events.on(this.engine, 'collisionEnd', (event) => {
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;
                
                // Remove contact tracking
                const contactKey = bodyA.id + '-' + bodyB.id;
                this.contactPairs.delete(contactKey);
                
                // Update pancake contact count
                if (Pancake.isPancake(bodyA) || Pancake.isPancake(bodyB)) {
                    const otherBody = Pancake.isPancake(bodyA) ? bodyB : bodyA;
                    if (['counter', 'griddle', 'plate', 'butter'].includes(otherBody.label)) {
                        Pancake.contactCount = Math.max(0, Pancake.contactCount - 1);
                        
                        // If no more contacts, pancake is in air
                        if (Pancake.contactCount === 0) {
                            Pancake.isResting = false;
                        }
                    }
                }
            });
        });
        
        Events.on(this.engine, 'beforeUpdate', () => {
            // Apply custom physics
            if (Pancake.body && Pancake.isInAir()) {
                // Apply air friction for floaty feel
                const velocity = Pancake.body.velocity;
                const friction = 1 - CONFIG.airFriction;
                
                Matter.Body.setVelocity(Pancake.body, {
                    x: velocity.x * friction,
                    y: velocity.y
                });
            }
        });
    },
    
    update() {
        if (Game.state === 'playing') {
            Matter.Engine.update(this.engine, 1000 / 60);
        }
    },
    
    createBody(x, y, width, height, options) {
        return Matter.Bodies.rectangle(x, y, width, height, options);
    },
    
    createCircle(x, y, radius, options) {
        return Matter.Bodies.circle(x, y, radius, options);
    },
    
    addBody(body) {
        Matter.World.add(this.world, body);
    },
    
    removeBody(body) {
        Matter.World.remove(this.world, body);
    },
    
    clearWorld() {
        Matter.World.clear(this.world);
        Matter.Engine.clear(this.engine);
        this.contactPairs.clear();
    }
};

window.Physics = Physics;