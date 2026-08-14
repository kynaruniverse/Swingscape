// ============================================================
// PANCAKE PLOP!   PANCAKE SYSTEM
// ============================================================
const Pancake = {
    body: null,
    isResting: true,
    isGrounded: false,
    hasFlipped: false,
    canFlipAgain: true,
    flipCooldown: 0,
    flipCount: 0,
    restingTime: 0,
    landingHandled: false,
    lastSurface: null,
    contactSurfaces: new Set(),
    ignoreButterUntil: 0,
    graphics: null,
    dangerGraphics: null,

    init() {
        if (this.body && Physics.world) Physics.removeBody(this.body);
        if (this.graphics && this.graphics.parent) this.graphics.parent.removeChild(this.graphics);

        this.body = Matter.Bodies.rectangle(CONFIG.pancake.start.x, CONFIG.startY, CONFIG.pancake.width, CONFIG.pancake.height, {
            label: 'pancake',
            density: CONFIG.pancake.density,
            friction: CONFIG.pancake.friction,
            frictionStatic: CONFIG.pancake.friction,
            frictionAir: CONFIG.pancake.frictionAir,
            restitution: CONFIG.pancake.restitution,
            angle: 0,
            chamfer: { radius: CONFIG.pancake.cornerRadius },
            sleepThreshold: Infinity
        });

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
        this.contactSurfaces.add('counter');
        this.ignoreButterUntil = 0;

        Physics.addBody(this.body);

        this.graphics = new PIXI.Graphics();
        Renderer.layers.pancake.addChild(this.graphics);
        this.updateGraphics();

        if (!this.dangerGraphics) {
            this.dangerGraphics = new PIXI.Graphics();
            Renderer.layers.effects.addChild(this.dangerGraphics);
            this.dangerGraphics.zIndex = 5;
            this.dangerGraphics.visible = false;
        }
    },
    drawPancakeGraphics() {
        if (!this.graphics) return;
        const g = this.graphics;
        g.clear();
        const width = CONFIG.pancake.width;
        const height = CONFIG.pancake.height;

        if (this.isGrounded) {
            g.beginFill(0x000000, 0.14);
            g.drawEllipse(0, height * 0.48, width / 2 + 4, 4);
            g.endFill();
        }

        g.beginFill(CONFIG.colors.pancake);
        g.drawRoundedRect(-width / 2, -height / 2, width, height, CONFIG.pancake.cornerRadius);
        g.endFill();

        g.lineStyle(1.5, 0xc48030, 0.95);
        g.drawRoundedRect(-width / 2, -height / 2, width, height, CONFIG.pancake.cornerRadius);

        g.beginFill(0xffffff, 0.16);
        g.drawRoundedRect(-width / 2 + 5, -height / 2 + 2, width - 10, 3, 2);
        g.endFill();

        g.beginFill(0xb97832, 0.25);
        g.drawCircle(-18, -2, 2);
        g.drawCircle(8, 1, 2);
        g.drawCircle(21, -2, 1.5);
        g.drawCircle(-4, -1, 1.5);
        g.endFill();

        const rawAngle = this.body ? this.body.angle : 0;
        const clampedAngle = Math.max(-Math.PI, Math.min(Math.PI, rawAngle));
        const normalizedAngle = Math.abs(clampedAngle);
        const roughlyFlat = normalizedAngle < CONFIG.gameplay.landing.angleTolerance || Math.abs(normalizedAngle - Math.PI) < CONFIG.gameplay.landing.angleTolerance;

        if (roughlyFlat) {
            g.beginFill(CONFIG.colors.butter);
            g.drawRoundedRect(-10, -9, 20, 10, 2);
            g.endFill();
            g.beginFill(CONFIG.colors.butterShadow);
            g.drawRect(-10, -1, 20, 2);
            g.endFill();
            g.beginFill(0xffffff, 0.4);
            g.drawRect(-7, -7, 7, 2);
            g.endFill();
        }

        g.beginFill(0x333333);
        g.drawCircle(-15, 0, 2.5);
        g.drawCircle(15, 0, 2.5);
        g.endFill();
        g.beginFill(0xffffff);
        g.drawCircle(-14, -1, 1);
        g.drawCircle(16, -1, 1);
        g.endFill();
        g.beginFill(0xff9696, 0.38);
        g.drawCircle(-22, 3, 4);
        g.drawCircle(22, 3, 4);
        g.endFill();
        g.beginFill(0x333333);
        if (this.isResting) {
            g.drawRoundedRect(-6, 1, 12, 4, 2);
        } else {
            g.drawRect(-5, 3, 10, 2);
        }
        g.endFill();
    },
    updateGraphics() {
        if (!this.body || !this.graphics) return;
        this.graphics.x = this.body.position.x;
        this.graphics.y = this.body.position.y;
        this.graphics.rotation = this.body.angle;
        this.drawPancakeGraphics();
    },
    flip(power) {
        if (!this.body || !this.canFlip()) return false;
        const normalizedPower = Math.max(0, Math.min(1, Number(power || 0) / CONFIG.gameplay.flip.maxPower));

        Matter.Sleeping.set(this.body, false);
        const upwardVelocity = -(CONFIG.gameplay.flip.upwardVelocityMin + normalizedPower * (CONFIG.gameplay.flip.upwardVelocityMax - CONFIG.gameplay.flip.upwardVelocityMin));
        const forwardVelocity = CONFIG.gameplay.flip.forwardVelocityMin + normalizedPower * (CONFIG.gameplay.flip.forwardVelocityMax - CONFIG.gameplay.flip.forwardVelocityMin);
        
        Matter.Body.setVelocity(this.body, { x: forwardVelocity, y: upwardVelocity });
        
        const angularVelocity = CONFIG.gameplay.flip.angularVelocityMin + normalizedPower * (CONFIG.gameplay.flip.angularVelocityMax - CONFIG.gameplay.flip.angularVelocityMin);
        Matter.Body.setAngularVelocity(this.body, angularVelocity);

        this.isResting = false;
        this.isGrounded = false;
        this.hasFlipped = true;
        this.canFlipAgain = false;
        this.flipCooldown = CONFIG.gameplay.flip.cooldown;
        this.restingTime = 0;
        this.contactSurfaces.clear();
        this.lastSurface = null;
        this.landingHandled = false;
        this.flipCount++;

        if (typeof Game !== 'undefined') {
            Game.flipsInLevel++;
            UI.showControlsHint(Game.flipsInLevel);
        }
        if (typeof AudioManager !== 'undefined') AudioManager.flip();
        if (this.dangerGraphics) {
            this.dangerGraphics.visible = false;
            this.dangerGraphics.clear();
        }
        if (typeof Particles !== 'undefined') {
            Particles.createFlip(this.body.position.x, this.body.position.y);
        }
        return true;
    },
    canFlip() {
        if (!this.body) return false;
        if (typeof Game !== 'undefined' && Game.state !== 'playing') return false;
        if (!this.canFlipAgain) return false;
        if (!this.isGrounded) return false;
        return true;
    },
    isPancake(body) {
        return !!(body && body.label === 'pancake');
    },
    isInAir() {
        return !!(this.body && !this.isGrounded);
    },
    beginContact(otherBody) {
        if (!this.body || !otherBody) return;
        const validSurfaces = ['counter', 'griddle', 'plate', 'butter'];
        if (!validSurfaces.includes(otherBody.label)) return;
        if (otherBody.label === 'butter' && this.ignoreButterUntil > performance.now()) return;
        
        this.contactSurfaces.add(otherBody.label);
        this.lastSurface = otherBody;
        this.updateGroundedState();
    },
    endContact(otherBody) {
        if (!otherBody) return;
        this.contactSurfaces.delete(otherBody.label);
        this.updateGroundedState();
    },
    updateGroundedState() {
        const grounded = this.contactSurfaces.size > 0;
        this.isGrounded = grounded;
        if (!grounded) {
            this.isResting = false;
            this.restingTime = 0;
        }
    },
    wrapHorizontal() {
        if (!this.body) return;
        const halfWidth = CONFIG.pancake.width / 2;
        const leftBound = -halfWidth;
        const rightBound = CONFIG.canvasWidth + halfWidth;
        
        if (this.body.position.x < leftBound) {
            const newX = CONFIG.canvasWidth + halfWidth;
            this.body.positionPrev.x = newX;
            Matter.Body.setPosition(this.body, { x: newX, y: this.body.position.y });
        } else if (this.body.position.x > rightBound) {
            const newX = -halfWidth;
            this.body.positionPrev.x = newX;
            Matter.Body.setPosition(this.body, { x: newX, y: this.body.position.y });
        }
    },
    fixedUpdate(deltaTime = CONFIG.physics.fixedDeltaTime) {
        if (!this.body) return;
        const dt = Math.max(0, Math.min(CONFIG.physics.maxFrameDelta, deltaTime));
        if (this.flipCooldown > 0) {
            this.flipCooldown -= dt;
            if (this.flipCooldown <= 0) {
                this.flipCooldown = 0;
                this.canFlipAgain = true;
            }
        }
        this.wrapHorizontal();
        this.updateGroundedState();
        this.checkLanding();
        if (this.isResting) {
            this.restingTime += dt;
        } else {
            this.restingTime = 0;
        }
    },
    renderUpdate() {
        this.updateGraphics();
        if (this.body && this.body.position.y > CONFIG.counterY + 100) {
            if (this.dangerGraphics) {
                this.dangerGraphics.visible = true;
                this.dangerGraphics.clear();
                const alpha = Math.min(1, (this.body.position.y - CONFIG.counterY - 100) / 100);
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
    },
    checkFell() {
        if (!this.body) return false;
        if (this.body.position.y > CONFIG.fallY) {
            if (typeof Game !== 'undefined') Game.lose();
            return true;
        }
        return false;
    },
    checkLanding() {
        if (!this.body || !this.hasFlipped || this.landingHandled) return;
        if (this.contactSurfaces.size === 0) return;
        
        const velocity = this.body.velocity;
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        const angularSpeed = Math.abs(this.body.angularVelocity);
        
        if (speed > CONFIG.gameplay.landing.maxSpeed) return;
        if (angularSpeed > CONFIG.gameplay.landing.maxAngularVelocity) return;
        
        let surface = this.lastSurface;
        if (!surface || !this.contactSurfaces.has(surface.label)) {
            const surfaceLabel = this.contactSurfaces.values().next().value;
            if (!surfaceLabel) return;
            surface = { label: surfaceLabel };
        }
        this.land(surface);
    },
    land(surface) {
        if (!this.body || this.landingHandled) return;
        this.landingHandled = true;
        this.isResting = true;
        this.isGrounded = true;
        this.hasFlipped = false;
        this.lastSurface = surface;
        this.restingTime = 0;

        Matter.Body.setVelocity(this.body, { x: this.body.velocity.x * 0.15, y: 0 });
        Matter.Body.setAngularVelocity(this.body, 0);

        const fullRotation = Math.PI * 2;
        let angle = this.body.angle % fullRotation;
        if (angle < 0) angle += fullRotation;
        const distanceToZero = Math.min(angle, fullRotation - angle);
        const distanceToPi = Math.abs(angle - Math.PI);
        const targetAngle = distanceToZero <= distanceToPi ? 0 : Math.PI;
        Matter.Body.setAngle(this.body, targetAngle);

        if (typeof Particles !== 'undefined') Particles.createLanding(this.body.position.x, this.body.position.y);
        
        if (surface.label === 'butter') {
            if (typeof AudioManager !== 'undefined') AudioManager.butterBounce();
        } else if (surface.label !== 'plate') {
            if (typeof AudioManager !== 'undefined') AudioManager.land();
        }

        if (surface.label === 'plate') {
            const isFaceUp = this.isFaceUp();
            if (isFaceUp) {
                if (typeof Game !== 'undefined') Game.win();
            } else {
                if (typeof Game !== 'undefined') Game.lose();
            }
            return;
        }

        if (surface.label === 'butter') {
            const butterX = surface.position ? surface.position.x : this.body.position.x;
            const direction = this.body.position.x <= butterX ? -1 : 1;
            const minHorizontal = CONFIG.obstacles.butter.minimumHorizontalBounceVelocity;
            
            let bounceX = this.body.velocity.x * CONFIG.obstacles.butter.bounceVelocityMultiplier;
            if (Math.abs(bounceX) < minHorizontal) bounceX = direction * minHorizontal;
            const bounceY = -Math.max(CONFIG.obstacles.butter.minimumBounceVelocity, Math.abs(this.body.velocity.y) * CONFIG.obstacles.butter.restitution);
            
            Matter.Body.setVelocity(this.body, { x: bounceX, y: bounceY });
            Matter.Body.setAngularVelocity(this.body, CONFIG.gameplay.flip.angularVelocityMin);
            
            const sepX = direction * 8;
            const sepY = -15;
            Matter.Body.setPosition(this.body, { x: this.body.position.x + sepX, y: this.body.position.y + sepY });
            
            this.ignoreButterUntil = performance.now() + 200;
            this.isResting = false;
            this.isGrounded = false;
            this.hasFlipped = true;
            this.landingHandled = false;
            this.contactSurfaces.clear();
            
            if (typeof UI !== 'undefined') UI.showMessage('Boing!');
            return;
        }

        if (surface.label === 'counter' || surface.label === 'griddle') {
            this.flipCooldown = 0;
            this.canFlipAgain = true;
            if (typeof UI !== 'undefined') UI.showMessage('Nice! Flip again!');
        }
    },
    isFaceUp() {
        if (!this.body) return true;
        const tolerance = CONFIG.gameplay.landing.angleTolerance;
        const fullRotation = Math.PI * 2;
        let angle = this.body.angle % fullRotation;
        if (angle < 0) angle += fullRotation;
        const distanceToZero = Math.min(angle, fullRotation - angle);
        return distanceToZero <= tolerance;
    }
};
window.Pancake = Pancake;
