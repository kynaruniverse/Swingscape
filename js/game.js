const Game = {
    state: 'menu',
    flipsInLevel: 0,
    level: 1,
    lastTime: performance.now(),
    accumulator: 0,
    animationFrameId: null,

    init() {
        Renderer.init();
        AudioManager.init();
        Particles.init();
        Physics.init();
        
        // Critical: Obstacles MUST initialize before Environment for steam logic to query them.
        Obstacles.init();
        Environment.init();
        
        Pancake.init();
        UI.init();
        Input.init();

        this.loop = this.loop.bind(this);
        this.animationFrameId = requestAnimationFrame(this.loop);
    },

    startLevel() {
        this.state = 'playing';
        this.flipsInLevel = 0;
        
        UI.hideOverlay();
        UI.showControlsHint(this.flipsInLevel);
        UI.updateLevel(this.level);
        
        Physics.clearWorld();
        Obstacles.init();
        Environment.init();
        Pancake.init();
        Input.cleanup();
    },

    loop(time) {
        this.animationFrameId = requestAnimationFrame(this.loop);
        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        if (this.state === 'playing') {
            this.accumulator += deltaTime;
            const fixedDt = CONFIG.physics.fixedDeltaTime;
            let steps = 0;
            
            while (this.accumulator >= fixedDt && steps < CONFIG.physics.maxPhysicsStepsPerFrame) {
                Physics.update();
                Pancake.fixedUpdate(fixedDt);
                this.accumulator -= fixedDt;
                steps++;
            }
            this.accumulator = this.accumulator % fixedDt;
            
            Input.update(deltaTime);
            Pancake.checkFell();
        }

        Particles.update(deltaTime);
        Environment.update();
        Obstacles.updateGraphics();
        Pancake.renderUpdate();
        Renderer.render();
    },

    win() {
        this.state = 'win';
        if (AudioManager) AudioManager.win();
        UI.showMessage("Perfect Landing!");
        
        if (Particles) {
            Particles.spawn(Pancake.body.position.x, Pancake.body.position.y, CONFIG.particles.maxWinParticles, 0xffd700);
        }

        setTimeout(() => {
            this.level++;
            UI.showOverlay('Level<br><span>Complete!</span>', 'Great job! Get ready for the next level.', 'Next Level');
        }, 2000);
    },

    lose() {
        this.state = 'gameover';
        if (AudioManager) AudioManager.lose();
        UI.showMessage("Oops!");
        
        setTimeout(() => {
            UI.showOverlay('Game<br><span>Over</span>', 'The pancake fell or landed badly.', 'Try Again');
        }, 1500);
    }
};

window.onload = () => {
    Game.init();
};
