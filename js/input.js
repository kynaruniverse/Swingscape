// Input Handling - Attached to Pixi Canvas
const Input = {
    isCharging: false,
    chargePower: 0,
    chargeInterval: null,
    lastChargeTime: 0,

    init() {
        this.isCharging = false;
        this.chargePower = 0;
        this.lastChargeTime = 0;

        if (this.chargeInterval) {
            clearInterval(this.chargeInterval);
            this.chargeInterval = null;
        }

        // Use the Pixi canvas for input
        const view = Renderer.app.view;
        view.addEventListener('mousedown', (e) => this.onPointerDown(e));
        view.addEventListener('mouseup', (e) => this.onPointerUp(e));
        view.addEventListener('mouseleave', (e) => this.onPointerUp(e));
        view.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.onPointerDown(e);
        }, { passive: false });
        view.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.onPointerUp(e);
        }, { passive: false });
        view.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.onPointerUp(e);
        }, { passive: false });

        console.log('Input initialized on Pixi canvas');
    },

    onPointerDown(e) {
        if (Game.state !== 'playing') return;
        if (!Pancake.canFlip()) return;

        this.isCharging = true;
        this.chargePower = 0;
        this.lastChargeTime = Date.now();

        this.chargeInterval = setInterval(() => {
            if (this.isCharging) {
                const now = Date.now();
                const deltaTime = (now - this.lastChargeTime) / 1000;
                this.lastChargeTime = now;
                this.chargePower = Math.min(CONFIG.maxFlipPower, this.chargePower + deltaTime * 5);
            }
        }, 16);
    },

    onPointerUp(e) {
        if (!this.isCharging) return;

        this.isCharging = false;
        if (this.chargeInterval) {
            clearInterval(this.chargeInterval);
            this.chargeInterval = null;
        }

        const power = this.chargePower;
        this.chargePower = 0;
        const flipped = Pancake.flip(power);
        if (flipped) {
            UI.showMessage('Stick the landing! 🛬');
        }
    },

    getChargePercent() {
        return Math.min(1, this.chargePower / CONFIG.maxFlipPower);
    },

    cleanup() {
        if (this.chargeInterval) {
            clearInterval(this.chargeInterval);
            this.chargeInterval = null;
        }
        this.isCharging = false;
        this.chargePower = 0;
    }
};

window.Input = Input;