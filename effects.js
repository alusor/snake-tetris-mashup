class Particle {
    constructor(x, y, vx, vy, color, size, lifetime, type = 'circle') {
        this.position = createVector(x, y);
        this.velocity = createVector(vx, vy);
        this.acceleration = createVector(0, 0);
        this.color = color;
        this.originalColor = color;
        this.size = size;
        this.originalSize = size;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.type = type;
        this.rotation = 0;
        this.rotationSpeed = random(-0.2, 0.2);
        this.alpha = 255;
        this.gravity = 0;
    }

    update() {
        this.velocity.add(this.acceleration);
        this.velocity.y += this.gravity;
        this.position.add(this.velocity);

        this.rotation += this.rotationSpeed;
        this.lifetime--;

        const lifeRatio = this.lifetime / this.maxLifetime;
        this.alpha = lifeRatio * 255;

        if (this.type === 'shrink') {
            this.size = this.originalSize * lifeRatio;
        }

        this.acceleration.mult(0);
    }

    addForce(force) {
        this.acceleration.add(force);
    }

    isDead() {
        return this.lifetime <= 0;
    }

    render() {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotation);

        if (Array.isArray(this.color)) {
            fill(this.color[0], this.color[1], this.color[2], this.alpha);
        } else {
            fill(red(this.color), green(this.color), blue(this.color), this.alpha);
        }
        noStroke();

        switch (this.type) {
            case 'circle':
                ellipse(0, 0, this.size, this.size);
                break;
            case 'square':
                rect(-this.size/2, -this.size/2, this.size, this.size);
                break;
            case 'star':
                this.drawStar(0, 0, this.size/2, this.size, 5);
                break;
            case 'triangle':
                triangle(0, -this.size/2, -this.size/2, this.size/2, this.size/2, this.size/2);
                break;
            case 'trail':
                ellipse(0, 0, this.size * 2, this.size);
                break;
        }
        pop();
    }

    drawStar(x, y, radius1, radius2, npoints) {
        let angle = TWO_PI / npoints;
        let halfAngle = angle / 2.0;
        beginShape();
        for (let a = 0; a < TWO_PI; a += angle) {
            let sx = x + cos(a) * radius2;
            let sy = y + sin(a) * radius2;
            vertex(sx, sy);
            sx = x + cos(a + halfAngle) * radius1;
            sy = y + sin(a + halfAngle) * radius1;
            vertex(sx, sy);
        }
        endShape(CLOSE);
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.screenShake = {
            intensity: 0,
            duration: 0,
            offsetX: 0,
            offsetY: 0
        };
        this.flash = {
            active: false,
            color: [255, 255, 255],
            alpha: 0,
            fadeSpeed: 10
        };
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }

        this.updateScreenShake();
        this.updateFlash();
    }

    render() {
        push();
        translate(this.screenShake.offsetX, this.screenShake.offsetY);

        for (let particle of this.particles) {
            particle.render();
        }

        pop();

        if (this.flash.active) {
            this.renderFlash();
        }
    }

    addParticle(particle) {
        this.particles.push(particle);
    }

    emitAppleCollectEffect(x, y) {
        const centerX = x * 20 + 10;
        const centerY = y * 20 + 10;

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * TWO_PI;
            const speed = random(2, 5);
            const vx = cos(angle) * speed;
            const vy = sin(angle) * speed;

            const particle = new Particle(
                centerX, centerY,
                vx, vy,
                [255, random(0, 100), 0],
                random(3, 8),
                random(30, 60),
                'circle'
            );
            particle.gravity = 0.1;
            this.addParticle(particle);
        }
    }

    emitPowerUpEffect(x, y) {
        const centerX = x * 20 + 10;
        const centerY = y * 20 + 10;

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * TWO_PI;
            const speed = random(3, 7);
            const vx = cos(angle) * speed;
            const vy = sin(angle) * speed;

            const particle = new Particle(
                centerX, centerY,
                vx, vy,
                [255, 215, 0],
                random(4, 10),
                random(60, 90),
                'star'
            );
            particle.rotationSpeed = random(-0.3, 0.3);
            this.addParticle(particle);
        }

        this.startFlash([255, 215, 0], 100);
    }

    emitTetrisLineClearEffect(y) {
        const lineY = y * 20 + 10;

        for (let x = 0; x < 40; x++) {
            const particle = new Particle(
                x * 20 + 10, lineY,
                random(-3, 3), random(-5, -2),
                [random(100, 255), random(100, 255), random(100, 255)],
                random(2, 6),
                random(30, 60),
                'square'
            );
            particle.gravity = 0.1;
            this.addParticle(particle);
        }
    }

    emitPieceDestroyEffect(x, y, color) {
        const centerX = x * 20 + 10;
        const centerY = y * 20 + 10;

        for (let i = 0; i < 6; i++) {
            const angle = random(TWO_PI);
            const speed = random(2, 6);
            const vx = cos(angle) * speed;
            const vy = sin(angle) * speed;

            const particle = new Particle(
                centerX, centerY,
                vx, vy,
                color,
                random(3, 7),
                random(20, 40),
                'square'
            );
            particle.gravity = 0.15;
            this.addParticle(particle);
        }
    }

    emitInvincibleTrail(x, y) {
        const centerX = x * 20 + 10;
        const centerY = y * 20 + 10;

        const particle = new Particle(
            centerX + random(-5, 5),
            centerY + random(-5, 5),
            random(-1, 1), random(-1, 1),
            [255, 255, 0],
            random(3, 6),
            20,
            'trail'
        );
        this.addParticle(particle);
    }

    shakeScreen(intensity, duration) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }

    updateScreenShake() {
        if (this.screenShake.duration > 0) {
            this.screenShake.duration--;
            const shake = this.screenShake.intensity * (this.screenShake.duration / 30);
            this.screenShake.offsetX = random(-shake, shake);
            this.screenShake.offsetY = random(-shake, shake);
        } else {
            this.screenShake.offsetX = 0;
            this.screenShake.offsetY = 0;
        }
    }

    startFlash(color, alpha) {
        this.flash.active = true;
        this.flash.color = color;
        this.flash.alpha = alpha;
    }

    updateFlash() {
        if (this.flash.active) {
            this.flash.alpha -= this.flash.fadeSpeed;
            if (this.flash.alpha <= 0) {
                this.flash.active = false;
                this.flash.alpha = 0;
            }
        }
    }

    renderFlash() {
        fill(this.flash.color[0], this.flash.color[1], this.flash.color[2], this.flash.alpha);
        noStroke();
        rect(0, 0, width, height);
    }

    clear() {
        this.particles = [];
    }
}

const particleSystem = new ParticleSystem();