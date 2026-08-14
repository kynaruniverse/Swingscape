// ============================================================
// PANCAKE PLOP!   INPUT SYSTEM
// Pointer-based charging and flip control
// ============================================================
const Input = {
    isCharging: false,
    chargePower: 0,
    lastChargeTime: 0,
    activePointerId: null,
    initialized: false,
    keyboardDown: false,
    keyboardActive: false,
    trajectoryGraphics: null,
    showTrajectory: false,
    handlers: {
        pointerdown: null,
        pointerup: null,
        pointercancel: null,
        lostpointercapture: null,
        keydown: null,
        keyup: null
    },

    init() {
        this.removeListeners();
        this.cleanup();
        const view = Renderer.app ? Renderer.app.view : null;
        if (!view) return;

        this.handlers.pointerdown = event => this.onPointerDown(event);
        this.handlers.pointerup = event => this.onPointerUp(event);
        this.handlers.pointercancel = event => this.onPointerCancel(event);
        this.handlers.lostpointercapture = event => this.onLostPointerCapture(event);

        view.addEventListener('pointerdown', this.handlers.pointerdown);
        view.addEventListener('pointerup', this.handlers.pointerup);
        view.addEventListener('pointercancel', this.handlers.pointercancel);
        view.addEventListener('lostpointercapture', this.handlers.lostpointercapture);
        view.style.touchAction = 'none';

        this.handlers.keydown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.keyboardDown && Game.state === 'playing') {
                    this.keyboardDown = true;
                    this.keyboardActive = true;
                    this.onPointerDown({ pointerType: 'keyboard', button: 0, currentTarget: view, preventDefault: () => {} });
                }
            }
        };
        this.handlers.keyup = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.keyboardDown) {
                    this.keyboardDown = false;
                    this.keyboardActive = false;
                    this.onPointerUp({ pointerType: 'keyboard', button: 0, currentTarget: view, preventDefault: () => {} });
                }
            }
        };
        document.addEventListener('keydown', this.handlers.keydown);
        document.addEventListener('keyup', this.handlers.keyup);

        if (!this.trajectoryGraphics) {
            this.trajectoryGraphics = new PIXI.Graphics();
            Renderer.layers.effects.addChild(this.trajectoryGraphics);
            this.trajectoryGraphics.zIndex = 35;
            this.trajectoryGraphics.visible = false;
        }
        this.initialized = true;
    },

    removeListeners() {
        const view = Renderer.app ? Renderer.app.view : null;
        if (view) {
            if (this.handlers.pointerdown) view.removeEventListener('pointerdown', this.handlers.pointerdown);
            if (this.handlers.pointerup) view.removeEventListener('pointerup', this.handlers.pointerup);
            if (this.handlers.pointercancel) view.removeEventListener('pointercancel', this.handlers.pointercancel);
            if (this.handlers.lostpointercapture) view.removeEventListener('lostpointercapture', this.handlers.lostpointercapture);
        }
        if (this.handlers.keydown) document.removeEventListener('keydown', this.handlers.keydown);
        if (this.handlers.keyup) document.removeEventListener('keyup', this.handlers.keyup);
    },

    onPointerDown(event) {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        if (Game.state !== 'playing') return;
        if (!Pancake.canFlip()) return;
        if (event.preventDefault) event.preventDefault();
        if (this.isCharging) return;

        this.isCharging = true;
        this.chargePower = 0;
        this.lastChargeTime = performance.now();
        this.activePointerId = event.pointerId;

        const view = event.currentTarget;
        if (view && typeof view.setPointerCapture === 'function' && event.pointerId !== undefined) {
            try { view.setPointerCapture(event.pointerId); } catch (e) {}
        }
        this.showTrajectory = true;
    },

    onPointerUp(event) {
        if (!this.isCharging) return;
        if (this.activePointerId !== null && event.pointerId !== undefined && event.pointerId !== this.activePointerId) return;
        if (event.preventDefault) event.preventDefault();
        this.finishCharge(event.currentTarget);
    },

    onPointerCancel(event) {
        if (!this.isCharging) return;
        if (this.activePointerId !== null && event.pointerId !== undefined && event.pointerId !== this.activePointerId) return;
        this.cancelCharge(event.currentTarget);
    },

    onLostPointerCapture(event) {
        if (!this.isCharging) return;
        if (this.activePointerId !== null && event.pointerId !== undefined && event.pointerId !== this.activePointerId) return;
        this.cancelCharge(event.currentTarget);
    },

    finishCharge(view) {
        if (!this.isCharging) return;
        
        this.isCharging = false;
        this.showTrajectory = false;
        if (this.trajectoryGraphics) {
            this.trajectoryGraphics.visible = false;
            this.trajectoryGraphics.clear();
        }
        
        if (this.activePointerId !== null && view && typeof view.releasePointerCapture === 'function') {
            try { view.releasePointerCapture(this.activePointerId); } catch(e) {}
        }
        this.activePointerId = null;

        if (this.chargePower >= CONFIG.gameplay.flip.minPower) {
            Pancake.flip(this.chargePower);
        }
        if (typeof UI !== 'undefined') UI.hideCharge();
    },

    cancelCharge(view) {
        this.isCharging = false;
        this.chargePower = 0;
        this.showTrajectory = false;
        if (this.trajectoryGraphics) {
            this.trajectoryGraphics.visible = false;
            this.trajectoryGraphics.clear();
        }
        if (this.activePointerId !== null && view && typeof view.releasePointerCapture === 'function') {
            try { view.releasePointerCapture(this.activePointerId); } catch(e) {}
        }
        this.activePointerId = null;
        if (typeof UI !== 'undefined') UI.hideCharge();
    },

    update(deltaTime) {
        if (this.isCharging) {
            this.chargePower += (CONFIG.gameplay.flip.chargeRate * 60) * deltaTime;
            if (this.chargePower > CONFIG.gameplay.flip.maxPower) {
                this.chargePower = CONFIG.gameplay.flip.maxPower;
            }
            if (typeof UI !== 'undefined') {
                UI.updateCharge(this.chargePower / CONFIG.gameplay.flip.maxPower);
            }
            this.drawTrajectory();
        }
    },

    drawTrajectory() {
        if (!this.showTrajectory || !this.trajectoryGraphics || !Pancake.body) return;
        const g = this.trajectoryGraphics;
        g.clear();
        g.visible = true;
        
        const powerRatio = this.chargePower / CONFIG.gameplay.flip.maxPower;
        const upwardVelocity = -(CONFIG.gameplay.flip.upwardVelocityMin + powerRatio * (CONFIG.gameplay.flip.upwardVelocityMax - CONFIG.gameplay.flip.upwardVelocityMin));
        const forwardVelocity = CONFIG.gameplay.flip.forwardVelocityMin + powerRatio * (CONFIG.gameplay.flip.forwardVelocityMax - CONFIG.gameplay.flip.forwardVelocityMin);
        
        let startX = Pancake.body.position.x;
        let startY = Pancake.body.position.y;
        const gravityY = CONFIG.physics.gravity.y * (CONFIG.physics.gravity.scale ?? 1);
        
        g.lineStyle(2, 0xffffff, 0.4);
        g.moveTo(startX, startY);
        for(let i=1; i<=20; i++) {
            let t = i * 2;
            let x = startX + forwardVelocity * t;
            let y = startY + upwardVelocity * t + 0.5 * gravityY * t * t;
            if (x > CONFIG.canvasWidth) {
                g.lineTo(CONFIG.canvasWidth, y);
                x -= CONFIG.canvasWidth;
                g.moveTo(0, y);
            } else if (x < 0) {
                g.lineTo(0, y);
                x += CONFIG.canvasWidth;
                g.moveTo(CONFIG.canvasWidth, y);
            }
            g.lineTo(x, y);
        }
    },
    
    cleanup() {
        this.isCharging = false;
        this.chargePower = 0;
        this.activePointerId = null;
        this.keyboardDown = false;
        this.keyboardActive = false;
        this.showTrajectory = false;
        if (this.trajectoryGraphics) {
            this.trajectoryGraphics.visible = false;
            this.trajectoryGraphics.clear();
        }
    }
};
window.Input = Input;
