// Global variables
let character;
let blocks;

const height = 400;
const width = 400;

let characterWidth = 40;
let characterHeight = 40;
let characterHp = 12;

let blockWidth = 80;
let blockHeight = 15;
let blockSpeed = -1.5;

let spaceBetweenBlock = 80;

let agent;
let state;
let currentTensorState;
let nextTensorState;
let reward;

function setup() {
    if (agent == null) agent = new Agent(actorModel, criticModel);
    reward = 1;

    createCanvas(height, width);
    blocks = [];
    blocks.push(
        new Block(
            width / 2 - blockWidth / 2,
            height / 2,
            blockWidth,
            blockHeight,
            blockSpeed
        )
    );

    for (let i = 1; i < 6; i++) {
        let randomX = (400 - blockWidth) * Math.random(1);
        blocks.push(
            new Block(
                randomX,
                height / 2 + i * spaceBetweenBlock,
                blockWidth,
                blockHeight,
                blockSpeed
            )
        );
    }

    character = new Character(
        width / 2 - characterWidth / 2,
        height / 2 - characterHeight,
        characterWidth,
        characterHeight,
        blockSpeed,
        characterHp
    );
}

async function draw() {
    background(200);

    // Update the state and reward based on the game's current state
    currentTensorState = getCurrentState();

    reward++;

    // Get the action from the agent
    const action = await agent.act(currentTensorState);
    // Perform the action
    performAction(action);

    for (let i = 0; i < blocks.length; i++) {
        blocks[i].update();
        blocks[i].show();
    }

    character.update(blocks);
    character.show();

    if (blocks[0]?.offScreen()) {
        blocks.splice(0, 1);
        let randomX = (400 - blockWidth) * Math.random(1);
        blocks.push(
            new Block(
                randomX,
                blocks[blocks.length - 1].y + spaceBetweenBlock,
                blockWidth,
                blockHeight,
                blockSpeed
            )
        );
    }
    nextTensorState = getCurrentState();

    // Learn from the experience
    await agent.learn(currentTensorState, action, reward, nextTensorState);

    if (character.checkDead()) {
        character = null;
        blocks = null;
        setup();
        draw();
    }
}

function getCurrentState() {
    let state = [];
    for (let block of blocks) {
        state.push(block.getX());
        state.push(block.getY());
    }
    state.push(character.getX());
    state.push(character.getY());
    state.push(character.getPreviousX());
    state.push(character.getVelocityY());
    state.push(character.getHp());
    state.push(character.checkDead() ? -1 : 1);

    return tf.tensor1d(state).reshape([1, 18]);
}

function performAction(action) {
    switch (action) {
        case 0:
            character.move("left");
            break;
        case 1:
            break;
        case 2:
            character.move("right");
            break;
    }
}
