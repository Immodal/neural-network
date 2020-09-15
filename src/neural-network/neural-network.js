Activations = {
  sigmoid: x => 1/(1+math.exp(-x)),

  // Derivative (y = sigmoid(x))
  dSigmoid: y => y * (1 - y),
}

NeuralNetwork = (nInputs, nHidden, nOutputs, learningRate=0.1) => {
  const nn = {}

  nn.lr = learningRate

  // sigmoid
  nn.activation = Activations.sigmoid

  // derivative of sigmoid
  nn.dactivation = Activations.dSigmoid

  // Number of columns in a matrix is equivalent to the number of inputs into the layer
  // Number of rows is equivalent to the number of nodes in the layer
  nn.ihWeights = math.random([nHidden, nInputs], -1, 1)
  nn.hoWeights = math.random([nOutputs, nHidden], -1, 1)

  // Biases for each layer
  nn.ihBias = math.ones([nHidden,1])
  nn.hoBias = math.ones([nOutputs,1])

  /**
   * 
   * @param {Array} input
   */
  nn.predict = input => {
    // Output of input through hidden layer
    const ihOut = nn.feedForward(input, nn.ihWeights, nn.ihBias)
    // Output of hidden layer through output layer
    return nn.feedForward(ihOut, nn.hoWeights, nn.hoBias)
  }

  /**
   * Convenience function for taking a 1D Array and converting it to the expected Nx1 matrix for inputs.
   * @param {*} inputArray 1D Array of inputs
   */
  nn.toInput = array => {
    // Assume inputArray is a 1D array [1,...,N]
    // We'll have to convert it to a Nx1 matrix
    // This converts inputArray to a 1xN matrix, and then transposes it to a Nx1:
    // [1, 2, 3] becomes [[1], [2], [3]]
    return math.transpose([array])
  }

  /**
   * 
   * @param {*} input 
   * @param {*} weights 
   * @param {*} bias 
   */
  nn.feedForward = (input, weights, bias) => {
    // Calculate weighted value of inputs for all 
    const weighted = math.multiply(weights, input)
    // Add bias to weighted values
    const biased = math.add(weighted, bias)
    // Run each node output through activation function
    return biased.map(row => row.map(nn.activation))
  }

  /**
   * 
   * @param {*} input 
   * @param {*} target 
   */
  nn.train = (input, target) => {
    // Output of input through hidden layer
    const ihOut = nn.feedForward(input, nn.ihWeights, nn.ihBias)
    // Output of hidden layer through output layer
    const hoOut =  nn.feedForward(ihOut, nn.hoWeights, nn.hoBias)

    // Difference between prediction and target
    const hoOutError = math.subtract(target, hoOut)
    // Derivative of current layers output
    const dhoOut = hoOut.map(row => row.map(nn.dactivation))
    // This particular step requires element wise multiplication
    // gradient = (lr * derivative of feedforward output of current layer * error)
    const hoGradient = math.dotMultiply(math.multiply(dhoOut, nn.lr), hoOutError)
    // delta weights = gradient * transpose(feedforward output of previous layer)
    const hoWeightsDelta = math.multiply(hoGradient, math.transpose(ihOut))

    // Calculate the contribution of each node toward the error of this layer via their weights
    const ihOutError = math.multiply(math.transpose(nn.hoWeights), hoOutError)
    const dihOut = ihOut.map(row => row.map(nn.dactivation))
    const ihGradient = math.dotMultiply(math.multiply(dihOut, nn.lr), ihOutError)
    const ihWeightsDelta = math.multiply(ihGradient, math.transpose(input))

    // Update weights at the very end so error contribution calculations are accurate
    nn.hoWeights = math.add(nn.hoWeights, hoWeightsDelta)
    // Update bias, the weight of bias is always 1, so the change is only the gradient
    nn.hoBias = math.add(nn.hoBias, hoGradient)

    nn.ihWeights = math.add(nn.ihWeights, ihWeightsDelta)
    nn.ihBias = math.add(nn.ihBias, ihGradient)
  }

  return nn
}