class Block {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.invisible = false;
    }

    offScreen() {
        return this.y < 0 - this.height;
    }

    update() {
        this.y += this.speed;
    }

    show() {
        rect(this.x, this.y, this.width, this.height);
    }

    standingOn(x, y, cWidth, cHeight) {
        return (
            x < this.x + this.width &&
            x + cWidth > this.x &&
            y == this.y - cHeight
        );
    }

    collidesWith(x, y, cWidth, cHeight) {
        if (this.invisible) return false;

        return (
            x < this.x + this.width &&
            x + cWidth > this.x &&
            y <= this.y - cHeight + 5 &&
            y >= this.y - cHeight - 9
        );
    }

    getSpeed() {
        return this.speed;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    setInvisible() {
        this.invisible = true;
    }

    getInvisible() {
        return this.invisible;
    }
}
