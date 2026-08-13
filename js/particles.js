// Particles - Pixi ParticleContainer
const Particles = {
    items: [],
    container: null,

    init() {
        this.container = new PIXI.ParticleContainer(10000, {
            scale: true,
            position: true,
            rotation: true,
            uvs: true,
            alpha: true
        });
        Renderer.layers.particles.addChild(this.container);
        this.items = [];
    },

    createFlip(x, y) {
        for (let i = 0; i < 20; i++) {
            const g = new PIXI.Graphics();
            g.beginFill(0xffd700);
            g.drawCircle(0, 0, 3);
            g.endFill();
            g.x = x;
            g.y = y;
            g.vx = (Math.random() - 0.5) * 8;
            g.vy = -Math.random() * 6;
            g.life = 1;
            this.container.addChild(g);
            this.items.push(g);
        }
    },

    createLanding(x, y) {
        for (let i = 0; i < 30; i++) {
            const g = new PIXI.Graphics();
            g.beginFill(0xffe0b3);
            g.drawCircle(0, 0, 2 + Math.random() * 3);
            g.endFill();
            g.x = x + (Math.random() - 0.5) * 40;
            g.y = y;
            g.vx = (Math.random() - 0.5) * 10;
            g.vy = -Math.random() * 8;
            g.life = 1;
            this.container.addChild(g);
            this.items.push(g);
        }
    },

    createWin(x, y) {
        for (let i = 0; i < 150; i++) {
            const g = new PIXI.Graphics();
            g.beginFill([0xffd700, 0xff6b6b, 0x6bcf7f, 0x6bcfff, 0xff9ff3][Math.floor(Math.random() * 5)]);
            g.drawCircle(0, 0, 2 + Math.random() * 6);
            g.endFill();
            g.x = x + (Math.random() - 0.5) * 100;
            g.y = y + (Math.random() - 0.5) * 50;
            g.vx = (Math.random() - 0.5) * 20;
            g.vy = -Math.random() * 15;
            g.life = 1;
            this.container.addChild(g);
            this.items.push(g);
        }
    },

    update() {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const p = this.items[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3;
            p.life -= 0.02;
            p.alpha = p.life;
            if (p.life <= 0) {
                this.container.removeChild(p);
                this.items.splice(i, 1);
            }
        }
    },

    draw() {
        // Pixi renders automatically
    }
};

window.Particles = Particles;