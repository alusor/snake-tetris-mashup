class GameManager {
    constructor() {
        this.GRID_SIZE = 20;
        this.COLS = 40;
        this.ROWS = 30;
        this.WIDTH = this.COLS * this.GRID_SIZE;
        this.HEIGHT = this.ROWS * this.GRID_SIZE;

        this.gameState = 'PLAYING';
        this.score = 0;
        this.highScore = this.loadHighScore();

        this.snake = null;
        this.tetris = null;
        this.apple = { x: 15, y: 15 };
        this.powerUp = null;
        this.invincible = false;
        this.invincibleTimer = 0;

        this.lastTetrisMove = 0;
        this.tetrisInterval = 1000;

        this.keys = {};

        this.init();
    }

    init() {
        this.snake = new Snake(this.COLS, this.ROWS);
        this.tetris = new Tetris(this.COLS, this.ROWS, this.GRID_SIZE);
        this.generateApple();
        this.updateUI();
    }

    loadHighScore() {
        return parseInt(localStorage.getItem('snakeTetrisHighScore')) || 0;
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeTetrisHighScore', this.highScore);
        }
    }

    generateApple() {
        do {
            this.apple.x = Math.floor(Math.random() * this.COLS);
            this.apple.y = Math.floor(Math.random() * this.ROWS);
        } while (this.isPositionOccupied(this.apple.x, this.apple.y));
    }

    generatePowerUp() {
        if (this.powerUp || Math.random() > 0.05) return;

        do {
            this.powerUp = {
                x: Math.floor(Math.random() * this.COLS),
                y: Math.floor(Math.random() * this.ROWS),
                glowPhase: 0
            };
        } while (this.isPositionOccupied(this.powerUp.x, this.powerUp.y));
    }

    isPositionOccupied(x, y) {
        if (this.snake.isPositionOccupied(x, y)) return true;
        if (this.tetris.grid[y] && this.tetris.grid[y][x]) return true;
        return false;
    }

    update() {
        if (this.gameState !== 'PLAYING') return;

        this.handleInput();

        const previousSnakePositions = this.snake.getPreviousPositions();
        this.snake.update();

        if (millis() - this.lastTetrisMove > this.tetrisInterval) {
            this.tetris.update();
            this.lastTetrisMove = millis();
        }

        this.tetris.updateSupportedPieces(this.snake.body, previousSnakePositions);

        this.checkCollisions();
        this.generatePowerUp();

        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }

        this.updateUI();
    }

    handleInput() {
        if (this.keys['ArrowUp'] && this.snake.direction.y !== 1) {
            this.snake.setDirection(0, -1);
        } else if (this.keys['ArrowDown'] && this.snake.direction.y !== -1) {
            this.snake.setDirection(0, 1);
        } else if (this.keys['ArrowLeft'] && this.snake.direction.x !== 1) {
            this.snake.setDirection(-1, 0);
        } else if (this.keys['ArrowRight'] && this.snake.direction.x !== -1) {
            this.snake.setDirection(1, 0);
        }

        if (this.keys['KeyA']) {
            this.tetris.movePiece(-1, 0);
            this.keys['KeyA'] = false;
        }
        if (this.keys['KeyD']) {
            this.tetris.movePiece(1, 0);
            this.keys['KeyD'] = false;
        }
        if (this.keys['KeyS']) {
            this.tetris.movePiece(0, 1);
        }
        if (this.keys['KeyW'] || this.keys['KeyG'] || this.keys['KeyH']) {
            this.tetris.rotatePiece();
            this.keys['KeyW'] = false;
            this.keys['KeyG'] = false;
            this.keys['KeyH'] = false;
        }
    }

    checkCollisions() {
        const head = this.snake.body[0];

        if (head.x < 0 || head.x >= this.COLS || head.y < 0 || head.y >= this.ROWS) {
            if (!this.invincible) this.gameOver();
            return;
        }

        for (let i = 1; i < this.snake.body.length; i++) {
            if (head.x === this.snake.body[i].x && head.y === this.snake.body[i].y) {
                if (!this.invincible) this.gameOver();
                return;
            }
        }

        if (this.tetris.grid[head.y] && this.tetris.grid[head.y][head.x]) {
            if (!this.invincible) {
                this.gameOver();
                return;
            } else {
                this.tetris.grid[head.y][head.x] = 0;
                this.score += 50;
            }
        }

        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.snake.grow();
            this.score += 10;
            this.generateApple();
        }

        if (this.powerUp && head.x === this.powerUp.x && head.y === this.powerUp.y) {
            this.activatePowerUp();
        }

        this.tetris.checkCollisionWithSnake(this.snake.body, this.apple);
    }

    activatePowerUp() {
        this.powerUp = null;
        this.invincible = true;
        this.invincibleTimer = 300;
        this.score += 100;
    }

    gameOver() {
        this.gameState = 'GAME_OVER';
        this.saveHighScore();
        document.getElementById('final-score').textContent = `PUNTUACIÓN FINAL: ${this.score}`;
        document.getElementById('game-over-screen').classList.remove('hidden');
    }

    restart() {
        this.gameState = 'PLAYING';
        this.score = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.powerUp = null;
        this.init();
        document.getElementById('game-over-screen').classList.add('hidden');
    }

    pause() {
        if (this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
        } else if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
        }
    }

    updateUI() {
        document.getElementById('current-score').textContent = `SCORE: ${this.score}`;
        document.getElementById('high-score').textContent = `HIGH: ${this.highScore}`;
    }

    render() {
        background(0);

        this.renderGrid();

        this.tetris.render();

        this.snake.render(this.invincible);

        this.renderApple();

        if (this.powerUp) {
            this.renderPowerUp();
        }

        if (this.gameState === 'PAUSED') {
            this.renderPauseScreen();
        }
    }

    renderGrid() {
        stroke(20, 40, 20);
        strokeWeight(1);

        for (let x = 0; x <= this.COLS; x++) {
            line(x * this.GRID_SIZE, 0, x * this.GRID_SIZE, this.HEIGHT);
        }

        for (let y = 0; y <= this.ROWS; y++) {
            line(0, y * this.GRID_SIZE, this.WIDTH, y * this.GRID_SIZE);
        }
    }

    renderApple() {
        fill(255, 0, 0);
        noStroke();
        ellipse(
            this.apple.x * this.GRID_SIZE + this.GRID_SIZE / 2,
            this.apple.y * this.GRID_SIZE + this.GRID_SIZE / 2,
            this.GRID_SIZE * 0.8,
            this.GRID_SIZE * 0.8
        );
    }

    renderPowerUp() {
        this.powerUp.glowPhase += 0.2;

        push();
        translate(
            this.powerUp.x * this.GRID_SIZE + this.GRID_SIZE / 2,
            this.powerUp.y * this.GRID_SIZE + this.GRID_SIZE / 2
        );

        let glowIntensity = sin(this.powerUp.glowPhase) * 100 + 155;
        fill(255, 215, 0, glowIntensity);

        rotate(frameCount * 0.05);

        noStroke();
        star(0, 0, this.GRID_SIZE * 0.3, this.GRID_SIZE * 0.6, 5);

        pop();
    }

    renderPauseScreen() {
        fill(0, 0, 0, 150);
        rect(0, 0, this.WIDTH, this.HEIGHT);

        fill(0, 255, 255);
        textAlign(CENTER, CENTER);
        textSize(48);
        text('PAUSADO', this.WIDTH / 2, this.HEIGHT / 2);

        textSize(24);
        text('Presiona SPACE para continuar', this.WIDTH / 2, this.HEIGHT / 2 + 60);
    }
}

function star(x, y, radius1, radius2, npoints) {
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

let game;

function setup() {
    const canvas = createCanvas(800, 600);
    canvas.parent('game-canvas');

    game = new GameManager();

    frameRate(60);
}

function draw() {
    game.update();
    game.render();
}

function keyPressed() {
    game.keys[key] = true;
    game.keys[keyCode] = true;

    if (key === ' ') {
        game.pause();
        return false;
    }

    if (key === 'r' || key === 'R') {
        if (game.gameState === 'GAME_OVER') {
            game.restart();
        }
        return false;
    }

    return false;
}

function keyReleased() {
    game.keys[key] = false;
    game.keys[keyCode] = false;
}