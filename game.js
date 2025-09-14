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

        // Combo system
        this.combo = 0;
        this.comboMultiplier = 1;
        this.lastAction = null;
        this.comboTimer = 0;
        this.maxCombo = 0;

        // Game statistics
        this.gameStats = {
            startTime: Date.now(),
            duration: 0,
            applesEaten: 0,
            tetrisPieces: 0,
            linesCleared: 0,
            powerUpsCollected: 0,
            maxCombo: 0,
            difficulty: 'Normal'
        };

        // Difficulty progression
        this.level = 1;
        this.pointsForNextLevel = 500;

        this.init();
    }

    init() {
        this.snake = new Snake(this.COLS, this.ROWS);
        this.tetris = new Tetris(this.COLS, this.ROWS, this.GRID_SIZE);
        this.generateApple();
        this.setupScoreboardEvents();
        this.updateUI();
        this.updateScoreboard();
    }

    setupScoreboardEvents() {
        // Tab switching
        document.getElementById('tab-scores').addEventListener('click', () => {
            this.switchTab('scores');
        });

        document.getElementById('tab-stats').addEventListener('click', () => {
            this.switchTab('stats');
        });

        // Clear data button
        document.getElementById('clear-data-btn').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres limpiar todos los datos?')) {
                scoreManager.clearAllData();
                this.updateScoreboard();
            }
        });

        // Name input modal events
        document.getElementById('save-score-btn').addEventListener('click', () => {
            this.savePlayerScore();
        });

        document.getElementById('skip-name-btn').addEventListener('click', () => {
            this.savePlayerScore('');
        });

        // Enter key in name input
        document.getElementById('player-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.savePlayerScore();
            }
        });
    }

    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            content.classList.add('hidden');
        });

        // Activate selected tab
        document.getElementById(`tab-${tabName}`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.remove('hidden');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        if (tabName === 'stats') {
            scoreManager.renderStats();
        }
    }

    updateScoreboard() {
        scoreManager.renderScoreboard();
        scoreManager.renderStats();
    }

    // Combo system methods
    addCombo(actionType) {
        if (this.lastAction === actionType || this.lastAction === null) {
            this.combo++;
            this.comboTimer = 300; // 5 seconds at 60fps
        } else {
            this.combo = 1;
        }

        this.lastAction = actionType;
        this.comboMultiplier = Math.min(1 + (this.combo - 1) * 0.5, 5); // Max x5 multiplier

        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
            this.gameStats.maxCombo = this.maxCombo;
        }

        this.updateComboDisplay();

        if (this.combo >= 3) {
            soundManager.play('invincibilityLoop', 0.5);
        }
    }

    updateComboDisplay() {
        const comboDisplay = document.getElementById('combo-display');
        const comboMultiplier = document.getElementById('combo-multiplier');

        if (this.combo >= 2) {
            comboDisplay.classList.remove('hidden');
            comboMultiplier.textContent = `x${this.comboMultiplier.toFixed(1)}`;
            comboMultiplier.style.color = this.combo >= 5 ? '#FFD700' : this.combo >= 3 ? '#FF6B35' : '#00FFFF';
        } else {
            comboDisplay.classList.add('hidden');
        }
    }

    resetCombo() {
        this.combo = 0;
        this.comboMultiplier = 1;
        this.lastAction = null;
        this.comboTimer = 0;
        this.updateComboDisplay();
    }

    updateDifficulty() {
        while (this.score >= this.pointsForNextLevel) {
            this.level++;
            this.pointsForNextLevel += 500;

            // Increase speed slightly
            this.snake.moveSpeed = Math.max(4, this.snake.moveSpeed - 0.5);
            this.tetrisInterval = Math.max(400, this.tetrisInterval - 50);

            // Flash effect for level up
            particleSystem.startFlash([0, 255, 255], 80);
            soundManager.play('powerUpAppear');

            this.gameStats.difficulty = this.getDifficultyName();
        }
    }

    getDifficultyName() {
        if (this.level >= 10) return 'Insane';
        if (this.level >= 7) return 'Hard';
        if (this.level >= 4) return 'Normal+';
        return 'Normal';
    }

    addScore(points, actionType = null) {
        const baseScore = Math.floor(points * this.comboMultiplier);
        this.score += baseScore;

        if (actionType) {
            this.addCombo(actionType);
        }

        this.updateDifficulty();
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

        soundManager.play('powerUpAppear');
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

        particleSystem.update();

        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer === 0) {
                this.resetCombo();
            }
        }

        if (this.invincible) {
            this.invincibleTimer--;
            const head = this.snake.body[0];
            if (frameCount % 3 === 0) {
                particleSystem.emitInvincibleTrail(head.x, head.y);
            }
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                soundManager.stopInvincibilityLoop();
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

        if (this.keys['a'] || this.keys['A']) {
            this.tetris.movePiece(-1, 0);
            this.keys['a'] = false;
            this.keys['A'] = false;
        }
        if (this.keys['d'] || this.keys['D']) {
            this.tetris.movePiece(1, 0);
            this.keys['d'] = false;
            this.keys['D'] = false;
        }
        if (this.keys['s'] || this.keys['S']) {
            this.tetris.movePiece(0, 1);
        }
        if (this.keys['w'] || this.keys['W'] || this.keys['g'] || this.keys['G'] || this.keys['h'] || this.keys['H']) {
            this.tetris.rotatePiece();
            this.keys['w'] = false;
            this.keys['W'] = false;
            this.keys['g'] = false;
            this.keys['G'] = false;
            this.keys['h'] = false;
            this.keys['H'] = false;
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
                particleSystem.shakeScreen(5, 15);
                this.gameOver();
                return;
            } else {
                const piece = this.tetris.grid[head.y][head.x];
                particleSystem.emitPieceDestroyEffect(head.x, head.y, piece.color);
                soundManager.play('pieceDestroy');
                particleSystem.shakeScreen(3, 10);
                this.tetris.grid[head.y][head.x] = 0;
                this.addScore(50, 'destroy');
            }
        }

        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.snake.grow();
            this.gameStats.applesEaten++;
            this.addScore(10, 'apple');
            particleSystem.emitAppleCollectEffect(this.apple.x, this.apple.y);
            soundManager.play('eatApple');
            this.generateApple();
        }

        if (this.powerUp && head.x === this.powerUp.x && head.y === this.powerUp.y) {
            this.activatePowerUp();
        }

        this.tetris.checkCollisionWithSnake(this.snake.body, this.apple);
    }

    activatePowerUp() {
        particleSystem.emitPowerUpEffect(this.powerUp.x, this.powerUp.y);
        soundManager.playInvincibilityStart();

        this.gameStats.powerUpsCollected++;
        this.powerUp = null;
        this.invincible = true;
        this.invincibleTimer = 300;
        this.addScore(100, 'powerup');
    }

    gameOver() {
        this.gameState = 'GAME_OVER';
        soundManager.stopInvincibilityLoop();
        soundManager.playGameOverSequence();
        this.resetCombo();

        // Update game duration
        this.gameStats.duration = Date.now() - this.gameStats.startTime;
        this.gameStats.score = this.score;

        // Check if it's a high score
        const isHighScore = scoreManager.isHighScore(this.score);
        const wasPersonalBest = this.score > this.highScore;
        this.saveHighScore();

        if (wasPersonalBest && this.score > 0) {
            setTimeout(() => soundManager.play('newHighScore'), 1000);
        }

        document.getElementById('final-score').textContent = `PUNTUACIÓN FINAL: ${this.score.toLocaleString()}`;

        if (isHighScore && this.score > 0) {
            this.showNameInputModal();
        } else {
            document.getElementById('game-over-screen').classList.remove('hidden');
        }
    }

    showNameInputModal() {
        const rank = scoreManager.getPlayerRank(this.score);

        document.getElementById('new-score-text').textContent = `Puntuación: ${this.score.toLocaleString()}`;
        document.getElementById('rank-position').textContent = `Posición en el ranking: #${rank}`;
        document.getElementById('player-name').value = '';
        document.getElementById('name-input-modal').classList.remove('hidden');

        // Focus on input
        setTimeout(() => {
            document.getElementById('player-name').focus();
        }, 100);
    }

    savePlayerScore(customName = null) {
        const playerName = customName !== null ? customName : document.getElementById('player-name').value.trim();

        const rank = scoreManager.addScore(playerName, this.score, this.gameStats);

        // Hide modal and show game over screen
        document.getElementById('name-input-modal').classList.add('hidden');

        if (rank <= 10) {
            document.getElementById('rank-text').textContent = `¡Posición #${rank} en el ranking!`;
            document.getElementById('rank-display').classList.remove('hidden');
        }

        document.getElementById('game-over-screen').classList.remove('hidden');
        this.updateScoreboard();
    }

    restart() {
        this.gameState = 'PLAYING';
        this.score = 0;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.powerUp = null;

        // Reset combo and difficulty
        this.resetCombo();
        this.level = 1;
        this.pointsForNextLevel = 500;
        this.tetrisInterval = 1000;

        // Reset game stats
        this.gameStats = {
            startTime: Date.now(),
            duration: 0,
            applesEaten: 0,
            tetrisPieces: 0,
            linesCleared: 0,
            powerUpsCollected: 0,
            maxCombo: 0,
            difficulty: 'Normal'
        };

        particleSystem.clear();
        soundManager.stopInvincibilityLoop();
        this.init();
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('rank-display').classList.add('hidden');
    }

    pause() {
        if (this.gameState === 'PLAYING') {
            this.gameState = 'PAUSED';
            soundManager.play('pause');
        } else if (this.gameState === 'PAUSED') {
            this.gameState = 'PLAYING';
            soundManager.play('pause', 0.8);
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

        particleSystem.render();
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