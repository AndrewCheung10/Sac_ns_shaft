// Define the actor model
const actorModel = tf.sequential();
actorModel.add(
    tf.layers.dense({
        units: 6,
        inputShape: [18],
        activation: "relu",
    })
);
actorModel.add(tf.layers.dense({ units: 6, activation: "relu" }));
actorModel.add(tf.layers.dense({ units: 3, activation: "softmax" }));

// Define the critic model
const criticModel = tf.sequential();

criticModel.add(
    tf.layers.dense({
        units: 6,
        inputShape: [18],
        activation: "relu",
    })
);
criticModel.add(tf.layers.dense({ units: 6, activation: "relu" }));
criticModel.add(tf.layers.dense({ units: 1, activation: "linear" }));

// Define the optimizer
const actorOptimizer = tf.train.adam();
const criticOptimizer = tf.train.adam();

// Define discount factor
discountFactor = 0.99;
// Compile the actor and critic models
actorModel.compile({
    optimizer: actorOptimizer,
    loss: "categoricalCrossentropy",
});
criticModel.compile({ optimizer: criticOptimizer, loss: "meanSquaredError" });

// Define the agent
class Agent {
    constructor(actorModel, criticModel) {
        this.actorModel = actorModel;
        this.criticModel = criticModel;
    }

    async act(state) {
        const prediction = this.actorModel.predict(state);
        // sample action from the predicted probability distribution
        const action = tf.multinomial(prediction, 1).dataSync()[0];
        return action;
    }

    async learn(state, action, reward, nextState) {
        // update the actor and critic models based on the experience tuple (state, action, reward, nextState)
        // update the actor model using the policy gradient
        const predictedAction = this.actorModel.predict(state);

        const actionGradients = tf.grad((predictedAction) =>
            tf.sum(predictedAction)
        )(this.actorModel.weights, reward);

        // this.actorModel.optimizer.applyGradients(
        //     zip(actionGradients, this.actorModel.weights)
        // );

        tf.tidy(() => {
            const actionGradients = tf.grad((predictedAction) =>
                tf.sum(predictedAction)
            )(this.actorModel.weights, reward);
            let grads = [];
            for (let i = 0; i < actionGradients.length; i++) {
                grads.push([actionGradients[i], this.actorModel.weights[i]]);
            }
            this.actorModel.optimizer.applyGradients(grads);
        });

        // update the critic model using the Q-value update rule
        const targetQValue =
            reward + discountFactor * this.criticModel.predict(nextState);
        const currentQValue = this.criticModel.predict(
            tf.concat([state, tf.oneHot(action, 3)], 1)
        );
        const loss = tf.losses.meanSquaredError(targetQValue, currentQValue);
        const grads = tf.grad(loss)(this.criticModel.weights);

        this.criticModel.optimizer.applyGradients(
            zip(grads, this.criticModel.weights)
        );
    }
}
