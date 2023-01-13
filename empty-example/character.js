class Character {
    constructor(x, y, width, height, velocityY, hp) {
        this.previousX = x;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 4;
        this.velocityY = velocityY;
        this.blockVelocity = velocityY;
        this.gravity = 0.4;
        this.currentBlock = null;
        this.hp = hp;
        this.dead = false;
    }

    checkFreefall(blocks) {
        if (
            this.currentBlock?.standingOn(
                this.x,
                this.y,
                this.width,
                this.height
            )
        ) {
            if (
                this.velocityY !== this.blockVelocity ||
                this.currentBlock.getInvisible()
            )
                return true;
            return false;
        }

        for (let i = 0; i < blocks.length; i++) {
            if (
                blocks[i].collidesWith(this.x, this.y, this.width, this.height)
            ) {
                if (blocks[i] != this.currentBlock) this.hp++;
                this.currentBlock = blocks[i];
                this.modifyPosition(this.currentBlock);
                return false;
            }
        }

        return true;
    }

    update(blocks) {
        this.checkArriveCeiling();

        this.keyDown();

        if (this.checkFreefall(blocks)) {
            this.velocityY += this.gravity;
            if (this.y > height + this.height) this.dead = true;
        } else this.velocityY = this.currentBlock.getSpeed();

        this.y += this.velocityY;
    }

    move(direction) {
        this.previousX = this.x;
        switch (direction) {
            case "left":
                this.x -= this.velocityX;
                break;
            case "right":
                this.x += this.velocityX;
                break;
            default:
                break;
        }
    }

    keyDown() {
        if (keyIsDown(37)) character.move("left");
        if (keyIsDown(39)) character.move("right");
    }

    show() {
        rect(this.x, this.y, this.width, this.height);
    }

    modifyPosition(block) {
        this.y = block.getY() - this.height;
    }

    checkArriveCeiling() {
        if (this.y <= 0) {
            if (!this.currentBlock?.getInvisible()) {
                this.hp -= 4;
                if (this.hp <= 0) this.dead = true;
                this.currentBlock?.setInvisible();
            }
        }
    }

    checkDead() {
        return this.dead;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getVelocityY() {
        return this.velocityY;
    }

    getPreviousX() {
        return this.previousX;
    }

    getHp() {
        return this.hp;
    }
}
