class Tetris {
    constructor(cols, rows, gridSize) {
        this.cols = cols;
        this.rows = rows;
        this.gridSize = gridSize;
        this.grid = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.pieceQueue = [];

        this.pieces = {
            'I': {
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: [0, 255, 255]
            },
            'O': {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: [255, 255, 0]
            },
            'T': {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: [128, 0, 128]
            },
            'S': {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ],
                color: [0, 255, 0]
            },
            'Z': {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ],
                color: [255, 0, 0]
            },
            'J': {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: [0, 0, 255]
            },
            'L': {
                shape: [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: [255, 165, 0]
            }
        };

        this.pieceTypes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        this.supportedBySnake = [];

        this.initGrid();
        this.spawnNewPiece();
    }

    initGrid() {
        for (let y = 0; y < this.rows; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.grid[y][x] = 0;
            }
        }
        this.supportedBySnake = JSON.parse(JSON.stringify(this.grid));
    }

    spawnNewPiece() {
        if (this.pieceQueue.length === 0) {
            this.refillQueue();
        }

        const pieceType = this.pieceQueue.shift();
        const piece = this.pieces[pieceType];

        this.currentPiece = {
            type: pieceType,
            shape: JSON.parse(JSON.stringify(piece.shape)),
            color: piece.color,
            x: Math.floor(this.cols / 2) - Math.floor(piece.shape[0].length / 2),
            y: 0,
            rotation: 0
        };

        if (this.checkCollision(this.currentPiece, 0, 0)) {
            return false;
        }

        return true;
    }

    refillQueue() {
        const shuffled = [...this.pieceTypes].sort(() => Math.random() - 0.5);
        this.pieceQueue.push(...shuffled);
    }

    update() {
        if (!this.currentPiece) return;

        if (this.canMove(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
        } else {
            this.placePiece();
            this.clearLines();
            if (!this.spawnNewPiece()) {
                return false;
            }
        }
        return true;
    }

    movePiece(dx, dy) {
        if (!this.currentPiece) return false;

        if (this.canMove(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            if (dx !== 0) soundManager.play('tetrisMove');
            return true;
        }
        return false;
    }

    rotatePiece() {
        if (!this.currentPiece) return false;

        const rotatedShape = this.rotateMatrix(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;

        this.currentPiece.shape = rotatedShape;

        if (!this.canMove(this.currentPiece, 0, 0)) {
            let wallKickTests = [
                [0, 0], [1, 0], [-1, 0], [0, -1], [1, -1], [-1, -1]
            ];

            let rotationSuccessful = false;
            for (let [dx, dy] of wallKickTests) {
                if (this.canMove(this.currentPiece, dx, dy)) {
                    this.currentPiece.x += dx;
                    this.currentPiece.y += dy;
                    rotationSuccessful = true;
                    break;
                }
            }

            if (!rotationSuccessful) {
                this.currentPiece.shape = originalShape;
                return false;
            }
        }

        this.currentPiece.rotation = (this.currentPiece.rotation + 1) % 4;
        soundManager.play('tetrisRotate');
        return true;
    }

    rotateMatrix(matrix) {
        const n = matrix.length;
        const rotated = [];

        for (let i = 0; i < n; i++) {
            rotated[i] = [];
            for (let j = 0; j < n; j++) {
                rotated[i][j] = matrix[n - 1 - j][i];
            }
        }

        return rotated;
    }

    canMove(piece, dx, dy) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;

        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;

                    if (boardX < 0 || boardX >= this.cols ||
                        boardY >= this.rows) {
                        return false;
                    }

                    if (boardY >= 0 && this.grid[boardY][boardX]) {
                        return false;
                    }
                }
            }
        }

        return !this.checkCollision(piece, dx, dy);
    }

    checkCollision(piece, dx, dy) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;

        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;

                    if (boardY >= 0 && this.grid[boardY] && this.grid[boardY][boardX]) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    checkCollisionWithSnake(snakeBody, apple) {
        if (!this.currentPiece) return;

        for (let segment of snakeBody) {
            if (this.isPieceAtPosition(this.currentPiece, segment.x, segment.y)) {
                this.placePiece();
                this.clearLines();
                if (!this.spawnNewPiece()) {
                    return false;
                }
                break;
            }
        }

        if (this.isPieceAtPosition(this.currentPiece, apple.x, apple.y)) {
            this.placePiece();
            this.clearLines();
            if (!this.spawnNewPiece()) {
                return false;
            }
        }

        return true;
    }

    isPieceAtPosition(piece, x, y) {
        if (!piece) return false;

        for (let py = 0; py < piece.shape.length; py++) {
            for (let px = 0; px < piece.shape[py].length; px++) {
                if (piece.shape[py][px]) {
                    const boardX = piece.x + px;
                    const boardY = piece.y + py;

                    if (boardX === x && boardY === y) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    placePiece() {
        if (!this.currentPiece) return;

        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;

                    if (boardY >= 0 && boardY < this.rows &&
                        boardX >= 0 && boardX < this.cols) {
                        this.grid[boardY][boardX] = {
                            color: this.currentPiece.color,
                            type: this.currentPiece.type
                        };
                    }
                }
            }
        }

        soundManager.play('tetrisPlace');

        // Update statistics
        if (typeof game !== 'undefined' && game.gameStats) {
            game.gameStats.tetrisPieces++;
        }

        this.currentPiece = null;
    }

    clearLines() {
        let linesCleared = 0;

        for (let y = this.rows - 1; y >= 0; y--) {
            let fullLine = true;
            for (let x = 0; x < this.cols; x++) {
                if (!this.grid[y][x]) {
                    fullLine = false;
                    break;
                }
            }

            if (fullLine) {
                particleSystem.emitTetrisLineClearEffect(y);
                this.grid.splice(y, 1);
                this.grid.unshift(new Array(this.cols).fill(0));
                this.supportedBySnake.splice(y, 1);
                this.supportedBySnake.unshift(new Array(this.cols).fill(false));
                y++;
                linesCleared++;
            }
        }

        if (linesCleared > 0) {
            soundManager.playTetrisLineClearSequence(linesCleared);

            // Update statistics and add score with combo
            if (typeof game !== 'undefined') {
                game.gameStats.linesCleared += linesCleared;
                const lineScore = linesCleared === 4 ? 800 : linesCleared * 100; // Tetris bonus
                game.addScore(lineScore, 'tetris');
            }
        }

        return linesCleared;
    }

    updateSupportedPieces(snakeBody, previousSnakePositions) {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.supportedBySnake[y][x] = false;
                for (let segment of snakeBody) {
                    if (segment.x === x && segment.y === y) {
                        this.supportedBySnake[y][x] = true;
                        break;
                    }
                }
            }
        }

        let piecesToFall = [];

        for (let y = this.rows - 2; y >= 0; y--) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] && this.supportedBySnake[y][x]) {
                    let wasSupported = false;
                    for (let prevPos of previousSnakePositions) {
                        if (prevPos.x === x && prevPos.y === y) {
                            wasSupported = true;
                            break;
                        }
                    }

                    if (wasSupported && !this.supportedBySnake[y][x]) {
                        if (this.canPieceFall(x, y)) {
                            piecesToFall.push({ x, y, piece: this.grid[y][x] });
                        }
                    }
                }
            }
        }

        for (let fallingPiece of piecesToFall) {
            this.grid[fallingPiece.y][fallingPiece.x] = 0;
            this.dropSinglePiece(fallingPiece.x, fallingPiece.y, fallingPiece.piece);
        }
    }

    canPieceFall(x, y) {
        return y < this.rows - 1 && !this.grid[y + 1][x] && !this.supportedBySnake[y + 1][x];
    }

    dropSinglePiece(x, startY, piece) {
        let newY = startY;
        while (newY < this.rows - 1 &&
               !this.grid[newY + 1][x] &&
               !this.supportedBySnake[newY + 1][x]) {
            newY++;
        }
        this.grid[newY][x] = piece;
    }

    render() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x]) {
                    const cell = this.grid[y][x];
                    fill(cell.color[0], cell.color[1], cell.color[2]);
                    noStroke();
                    rect(x * this.gridSize, y * this.gridSize,
                         this.gridSize, this.gridSize);

                    stroke(255, 255, 255, 100);
                    strokeWeight(1);
                    noFill();
                    rect(x * this.gridSize, y * this.gridSize,
                         this.gridSize, this.gridSize);
                }
            }
        }

        if (this.currentPiece) {
            fill(this.currentPiece.color[0],
                 this.currentPiece.color[1],
                 this.currentPiece.color[2]);
            noStroke();

            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        const drawX = (this.currentPiece.x + x) * this.gridSize;
                        const drawY = (this.currentPiece.y + y) * this.gridSize;

                        if (drawY >= 0) {
                            rect(drawX, drawY, this.gridSize, this.gridSize);

                            stroke(255, 255, 255, 150);
                            strokeWeight(1);
                            noFill();
                            rect(drawX, drawY, this.gridSize, this.gridSize);
                            noStroke();
                        }
                    }
                }
            }
        }
    }
}