class Snake {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.body = [{ x: 10, y: 15 }];
        this.direction = { x: 1, y: 0 };
        this.growing = false;
        this.moveCounter = 0;
        this.moveSpeed = 8;
        this.previousPositions = [];
    }

    setDirection(x, y) {
        if (this.direction.x === -x && this.direction.y === -y) {
            return;
        }
        this.direction.x = x;
        this.direction.y = y;
    }

    update() {
        this.moveCounter++;
        if (this.moveCounter < this.moveSpeed) {
            return;
        }
        this.moveCounter = 0;

        this.previousPositions = [...this.body];

        const head = { ...this.body[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        this.body.unshift(head);

        if (!this.growing) {
            this.body.pop();
        } else {
            this.growing = false;
        }
    }

    grow() {
        this.growing = true;
    }

    isPositionOccupied(x, y) {
        for (let segment of this.body) {
            if (segment.x === x && segment.y === y) {
                return true;
            }
        }
        return false;
    }

    getHead() {
        return this.body[0];
    }

    getPreviousPositions() {
        return this.previousPositions;
    }

    render(invincible = false) {
        for (let i = 0; i < this.body.length; i++) {
            const segment = this.body[i];

            if (invincible) {
                let alpha = sin(frameCount * 0.3) * 127 + 128;
                fill(255, 255, 0, alpha);
            } else if (i === 0) {
                fill(0, 255, 0);
            } else {
                fill(0, 200, 0);
            }

            noStroke();
            rect(
                segment.x * 20,
                segment.y * 20,
                20,
                20
            );

            if (i === 0) {
                fill(255);
                ellipse(
                    segment.x * 20 + 6,
                    segment.y * 20 + 6,
                    3, 3
                );
                ellipse(
                    segment.x * 20 + 14,
                    segment.y * 20 + 6,
                    3, 3
                );
            }
        }
    }
}