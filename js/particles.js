const Particles = {
    particles: [],
    
    init() {
        this.particles = [];
    },
    
    createFlip(x, y) {
        this.spawn(x, y, CONFIG.particles.maxFlipParticles, 0xffffff);
    },
    
    createLanding(x, y) {
        this.spawn(x, y, CONFIG.particles.maxLandingParticles, 0xe8a860);
    },
    
    spawn(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const p = new PIXI.Graphics();
            p.beginFill(color);
            p.drawCircle(0, 0, 2 + Math.random() * 2);
            p.endFill();
            p.x = x;
            p.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5;
            Renderer.layers.effects.addChild(p);
            this.particles.push({
                graphic: p,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.02 + Math.random() * 0.03
            });
        }
    },
    
    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vy += CONFIG.particles.gravity;
            p.graphic.x += p.vx;
            p.graphic.y += p.vy;
            p.life -= p.decay;
            p.graphic.alpha = Math.max(0, p.life);
            if (p.life <= 0) {
                Renderer.layers.effects.removeChild(p.graphic);
                p.graphic.destroy();
                this.particles.splice(i, 1);
            }
        }
    }
};
window.Particles = Particles;
