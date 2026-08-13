// Pancake Logic - Full with Pixi Graphics
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

    init() {
        const { Bodies, Body } = Matter;

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
                chamfer: { radius: 7 },
                frictionAir: 0.01
            }
        );

        this.isResting = true;
        this.restingTime = 0;
        this.flipCount = 0;
        this.trailPositions = [];
        this.hasFlipped = false;
        this.canFlipAgain = true;
        this.lastFlipTime = 0;
        this.contactCount = 0;

        Physics.addBody(this.body);

        // Create Pixi Graphics
        this.graphics = new PIXI.Graphics();
        this.drawPancakeGraphics();
        Renderer.layers.pancake.addChild(this.graphics);

        console.log('Pancake initialized with Pixi graphics at:', this.body.position);
    },

    drawPancakeGraphics() {
        const g = this.graphics;
        g.clear();

        // Shadow
        g.beginFill(0x000000, 0.15);
        g.drawEllipse(0, 3, CONFIG.pancakeWidth / 2 + 2, CONFIG.pancakeHeight / 2 - 1);
        g.endFill();

        // Pancake body
        const gradient = new PIXI.FillGradient(0, -CONFIG.pancakeHeight/2, 0, CONFIG.pancakeHeight/2);
        gradient.addColorStop(0, CONFIG.colors.pancakeLight);
        gradient.addColorStop(0.5, CONFIG.colors.pancake);
        gradient.addColorStop(1, CONFIG.colors.pancakeDark);
        g.beginFill(gradient);
        g.drawRoundedRect(
            -CONFIG.pancakeWidth/2,
            -CONFIG.pancakeHeight/2,
            CONFIG.pancakeWidth,
            CONFIG.pancakeHeight,
            7
        );
        g.endFill();

        // Border
        g.lineStyle(1.5, 0xc48030);
        g.drawRoundedRect(
            -CONFIG.pancakeWidth/2,
            -CONFIG.pancakeHeight/2,
            CONFIG.pancakeWidth,
            CONFIG.pancakeHeight,
            7
        );

        // Butter pat (only when roughly flat)
        if (Math.abs(this.body.angle) < 0.2 || Math.abs(Math.abs(this.body.angle) - Math.PI) < 0.2) {
            g.beginFill(CONFIG.colors.butter);
            g.drawRect(-10, -10, 20, 10);
            g.endFill();
            g.beginFill(CONFIG.colors.butterShadow);
            g.drawRect(-10, -2, 20, 2);
            g.endFill();
        }

        // Face
        if (Game.state === 'playing') {
            // Eyes
            g.beginFill(0x333333);
            g.drawCircle(-15, 0, 2.5);
            g.drawCircle(15, 0, 2.5);
            g.endFill();

            // Eye shine
            g.beginFill(0xffffff);
            g.drawCircle(-14, -1, 1);
            g.drawCircle(16, -1, 1);
            g.endFill();

            // Mouth
            if (this.isResting) {
                g.lineStyle(2, 0x333333);
                g.arc(0, 3, 6, 0.1 * Math.PI, 0.9 * Math.PI);
                g.stroke();
            } else {
                g.lineStyle(2, 0x333333);
                g.moveTo(-5, 4);
                g.lineTo(5, 4);
                g.stroke();
            }

            // Rosy cheeks
            g.beginFill(0xff9696, 0.4);
            g.drawCircle(-22, 3, 5);
            g.drawCircle(22, 3, 5);
            g.endFill();
        }
    },

    updateGraphics() {
        if (this.body && this.graphics) {
            this.graphics.x = this.body.position.x;
            this.graphics.y = this.body.position.y;
            this.graphics.rotation = this.body.angle;

            // Squash and stretch will be implemented later
        }
    },

    flip(power) {
        if (!this.body) return false;
        if (!this.canFlipAgain) return false;

        const { Body } = Matter;
        power = power || 5;
        const normalizedPower = Math.min(1, power / CONFIG.maxFlipPower);

        const upwardForce = -(5 + normalizedPower * 15);
        const forwardForce = 3 + normalizedPower * 8;

        Matter.Sleeping.set(this.body, false);

        this.body.velocity.x = forwardForce;
        this.body.velocity.y = upwardForce;

        const currentAngle = this.body.angle % (Math.PI * 2);
        let targetAngle = 0;
        if (currentAngle > Math.PI / 2 && currentAngle < Math.PI * 1.5) {
            targetAngle = Math.PI;
        }
        const rotationDirection = targetAngle > currentAngle ? 1 : -1;
        Matter.Body.setAngularVelocity(this.body, rotationDirection * (0.05 + normalizedPower * 0.15));

        this.body.frictionAir = CONFIG.airFriction;

        this.isResting = false;
        this.hasFlipped = true;
        this.canFlipAgain = false;
        this.lastFlipTime = Date.now();
        this.flipCount++;

        Particles.createFlip(this.body.position.x, this.body.position.y);

        setTimeout(() => {
            this.canFlipAgain = true;
        }, 1000);

        return true;
    },

    canFlip() {
        return this.body && 
               (this.isResting || this.contactCount > 0) && 
               this.canFlipAgain && 
               Game.state === 'playing';
    },

    isPancake(body) {
        return body && body.label === 'pancake';
    },

    isInAir() {
        if (!this.body) return false;
        return Math.abs(this.body.velocity.y) > 0.5;
    },

    handleCollision(otherBody) {
        if (!this.body) return;

        const isSurface = ['counter', 'griddle', 'plate'].includes(otherBody.label);
        const isButter = otherBody.label === 'butter';

        if (isSurface || isButter) {
            this.contactCount++;
            const speed = Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2);
            if (speed < 2 && this.hasFlipped) {
                this.land(otherBody);
            }
        }
    },

    land(surface) {
        this.isResting = true;
        this.hasFlipped = false;
        this.body.frictionAir = 0.01;
        Matter.Body.setAngularVelocity(this.body, 0);

        Particles.createLanding(this.body.position.x, this.body.position.y);

        if (surface.label === 'plate') {
            Game.win();
        } else if (surface.label === 'counter' || surface.label === 'griddle') {
            UI.showMessage('Flip again! 🥞');
        } else if (surface.label === 'butter') {
            const bounceVelocity = {
                x: this.body.velocity.x * 1.5,
                y: -Math.abs(this.body.velocity.y) * CONFIG.butterRestitution
            };
            Matter.Body.setVelocity(this.body, bounceVelocity);
            UI.showMessage('Boing! 🧈');
            this.isResting = false;
            this.hasFlipped = true;
        }
        this.drawPancakeGraphics();
    },

    checkFell() {
        if (this.body && this.body.position.y > CONFIG.canvasHeight + 100) {
            Game.lose();
            return true;
        }
        return false;
    },

    updateTrail() {
        if (this.hasFlipped && this.body) {
            this.trailPositions.push({
                x: this.body.position.x,
                y: this.body.position.y,
                life: 1
            });
        }

        if (this.trailPositions.length > 50) {
            this.trailPositions.shift();
        }

        for (let i = this.trailPositions.length - 1; i >= 0; i--) {
            this.trailPositions[i].life -= 0.03;
            this.trailPositions[i].y += 0.5;
            if (this.trailPositions[i].life <= 0) {
                this.trailPositions.splice(i, 1);
            }
        }
    }
};

window.Pancake = Pancake;