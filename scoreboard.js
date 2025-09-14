class ScoreManager {
    constructor() {
        this.maxScores = 10;
        this.storageKey = 'snakeTetrisLeaderboard';
        this.statsKey = 'snakeTetrisStats';
        this.scores = this.loadScores();
        this.stats = this.loadStats();
    }

    loadScores() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : [];
    }

    loadStats() {
        const saved = localStorage.getItem(this.statsKey);
        return saved ? JSON.parse(saved) : {
            totalGames: 0,
            totalScore: 0,
            totalTime: 0,
            applesEaten: 0,
            tetrisPieces: 0,
            linesCleared: 0,
            powerUpsCollected: 0,
            bestCombo: 0,
            achievements: []
        };
    }

    saveScores() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
    }

    saveStats() {
        localStorage.setItem(this.statsKey, JSON.stringify(this.stats));
    }

    addScore(playerName, score, gameStats) {
        const scoreEntry = {
            name: playerName || 'Anónimo',
            score: score,
            date: new Date().toISOString(),
            duration: gameStats.duration || 0,
            applesEaten: gameStats.applesEaten || 0,
            tetrisPieces: gameStats.tetrisPieces || 0,
            linesCleared: gameStats.linesCleared || 0,
            maxCombo: gameStats.maxCombo || 0,
            difficulty: gameStats.difficulty || 'Normal'
        };

        this.scores.push(scoreEntry);
        this.scores.sort((a, b) => b.score - a.score);

        if (this.scores.length > this.maxScores) {
            this.scores = this.scores.slice(0, this.maxScores);
        }

        this.updateGlobalStats(gameStats);
        this.saveScores();
        this.saveStats();

        return this.getPlayerRank(score);
    }

    updateGlobalStats(gameStats) {
        this.stats.totalGames++;
        this.stats.totalScore += gameStats.score || 0;
        this.stats.totalTime += gameStats.duration || 0;
        this.stats.applesEaten += gameStats.applesEaten || 0;
        this.stats.tetrisPieces += gameStats.tetrisPieces || 0;
        this.stats.linesCleared += gameStats.linesCleared || 0;
        this.stats.powerUpsCollected += gameStats.powerUpsCollected || 0;

        if (gameStats.maxCombo > this.stats.bestCombo) {
            this.stats.bestCombo = gameStats.maxCombo;
        }
    }

    getPlayerRank(score) {
        for (let i = 0; i < this.scores.length; i++) {
            if (this.scores[i].score <= score) {
                return i + 1;
            }
        }
        return this.scores.length + 1;
    }

    isHighScore(score) {
        return this.scores.length < this.maxScores ||
               score > this.scores[this.scores.length - 1].score;
    }

    getTopScores(limit = 10) {
        return this.scores.slice(0, limit);
    }

    getStats() {
        const avgScore = this.stats.totalGames > 0
            ? Math.round(this.stats.totalScore / this.stats.totalGames)
            : 0;

        return {
            ...this.stats,
            avgScore,
            totalTimeFormatted: this.formatTime(this.stats.totalTime)
        };
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5);
    }

    clearAllData() {
        this.scores = [];
        this.stats = {
            totalGames: 0,
            totalScore: 0,
            totalTime: 0,
            applesEaten: 0,
            tetrisPieces: 0,
            linesCleared: 0,
            powerUpsCollected: 0,
            bestCombo: 0,
            achievements: []
        };
        this.saveScores();
        this.saveStats();
    }

    renderScoreboard() {
        const container = document.getElementById('scoreboard-list');
        if (!container) return;

        container.innerHTML = '';

        this.scores.forEach((score, index) => {
            const row = document.createElement('div');
            row.className = 'score-entry';

            const rankClass = index < 3 ? `rank-${index + 1}` : '';

            row.innerHTML = `
                <div class="rank ${rankClass}">#${index + 1}</div>
                <div class="player-info">
                    <div class="player-name">${score.name}</div>
                    <div class="player-stats">
                        🍎${score.applesEaten} 🧱${score.tetrisPieces} ⚡x${score.maxCombo}
                    </div>
                </div>
                <div class="score-info">
                    <div class="score-points">${score.score.toLocaleString()}</div>
                    <div class="score-date">${this.formatDate(score.date)}</div>
                </div>
            `;

            container.appendChild(row);
        });

        if (this.scores.length === 0) {
            container.innerHTML = '<div class="no-scores">¡Sé el primero en el ranking!</div>';
        }
    }

    renderStats() {
        const container = document.getElementById('stats-content');
        if (!container) return;

        const stats = this.getStats();

        container.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Partidas Jugadas:</span>
                <span class="stat-value">${stats.totalGames}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Puntuación Promedio:</span>
                <span class="stat-value">${stats.avgScore.toLocaleString()}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Tiempo Total:</span>
                <span class="stat-value">${stats.totalTimeFormatted}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Manzanas Comidas:</span>
                <span class="stat-value">${stats.applesEaten.toLocaleString()}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Piezas de Tetris:</span>
                <span class="stat-value">${stats.tetrisPieces.toLocaleString()}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Líneas Completadas:</span>
                <span class="stat-value">${stats.linesCleared.toLocaleString()}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Power-ups Obtenidos:</span>
                <span class="stat-value">${stats.powerUpsCollected}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Mejor Combo:</span>
                <span class="stat-value">x${stats.bestCombo}</span>
            </div>
        `;
    }
}

const scoreManager = new ScoreManager();