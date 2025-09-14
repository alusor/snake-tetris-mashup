class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.sounds = this.initializeSounds();
    }

    initializeSounds() {
        return {
            // Snake sounds
            eatApple: [0.3, 0, 400, 0.02, 0.05, 0.2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            snakeGrow: [0.5, 0, 220, 0.02, 0.1, 0.4, 1, 1.5, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            snakeDeath: [1.5, 0, 150, 0.02, 0.3, 0.8, 4, 0.1, -2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],

            // Tetris sounds
            tetrisMove: [0.1, 0, 800, 0.01, 0.01, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            tetrisRotate: [0.2, 0, 600, 0.01, 0.02, 0.15, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            tetrisPlace: [0.4, 0, 120, 0.01, 0.1, 0.2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            tetrisLineClear: [1.2, 0, 300, 0.02, 0.3, 0.6, 1, 2, 0, 0, 50, 0.05, 0, 0, 0, 0, 0, 0, 1],

            // Power-up sounds
            powerUpAppear: [0.8, 0, 200, 0.1, 0.2, 0.4, 1, 1.5, 3, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            powerUpCollect: [1.5, 0, 100, 0.05, 0.4, 0.9, 1, 2.5, 5, 10, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            invincibilityLoop: [0.3, 0, 440, 0.01, 0.1, 0.2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            pieceDestroy: [0.6, 0, 300, 0.01, 0.1, 0.3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],

            // UI sounds
            pause: [0.3, 0, 300, 0.02, 0.1, 0.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            gameOver: [2, 0, 200, 0.1, 0.8, 1.2, 4, 0.2, -5, -2, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            newHighScore: [2.5, 0, 150, 0.1, 0.6, 1.5, 1, 2, 8, 12, 0, 0, 0, 0, 0, 0, 0, 0, 1]
        };
    }

    play(soundName, volumeMultiplier = 1) {
        if (!this.enabled || !this.sounds[soundName]) return;

        if (typeof zzfx === 'undefined') {
            console.warn('ZzFX library not loaded - sounds disabled');
            return;
        }

        try {
            const soundParams = [...this.sounds[soundName]];
            soundParams[0] = soundParams[0] * this.volume * volumeMultiplier;
            zzfx(...soundParams);
        } catch (error) {
            console.warn(`Could not play sound: ${soundName}`, error);
        }
    }

    playSequence(sounds, delays) {
        sounds.forEach((soundName, index) => {
            setTimeout(() => {
                this.play(soundName);
            }, delays[index] || index * 100);
        });
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    playTetrisLineClearSequence(linesCleared) {
        if (linesCleared === 1) {
            this.play('tetrisLineClear');
        } else if (linesCleared === 2) {
            this.play('tetrisLineClear', 1.2);
        } else if (linesCleared === 3) {
            this.playSequence(['tetrisLineClear', 'tetrisLineClear'], [0, 150]);
        } else if (linesCleared === 4) {
            this.playSequence(['tetrisLineClear', 'tetrisLineClear', 'newHighScore'], [0, 100, 300]);
        }
    }

    playInvincibilityStart() {
        this.play('powerUpCollect');
        this.startInvincibilityLoop();
    }

    startInvincibilityLoop() {
        if (this.invincibilityInterval) {
            clearInterval(this.invincibilityInterval);
        }

        let counter = 0;
        this.invincibilityInterval = setInterval(() => {
            if (counter < 5) {
                this.play('invincibilityLoop', 0.3);
                counter++;
            }
        }, 1000);
    }

    stopInvincibilityLoop() {
        if (this.invincibilityInterval) {
            clearInterval(this.invincibilityInterval);
            this.invincibilityInterval = null;
        }
    }

    playGameOverSequence() {
        this.playSequence(['snakeDeath', 'gameOver'], [0, 500]);
    }
}

const soundManager = new SoundManager();