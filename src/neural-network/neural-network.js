Activations = {
  sigmoid: x => 1/(1+math.exp(-x)),

  // Derivative (y = sigmoid(x))
  dSigmoid: y => y * (1 - y),
}

NeuralNetwork = (nInputs, nHidden, nHiddenLayers, nOutputs, learningRate=0.1) => {
  const nn = {}

  nn.lr = learningRate

  // sigmoid
  nn.activation = Activations.sigmoid

  // derivative of sigmoid
  nn.dactivation = Activations.dSigmoid

  // Number of columns in a matrix is equivalent to the number of inputs into the layer
  // Number of rows is equivalent to the number of nodes in the layer
  nn.ihWeights = math.random([nHidden, nInputs], -1, 1)
  nn.ihBias = math.ones([nHidden,1])
  
  nn.hhWeights = math.random([nHiddenLayers-1, nHidden, nHidden], -1, 1)
  nn.hhBias = math.ones([nHiddenLayers-1, nHidden, 1])

  nn.hoWeights = math.random([nOutputs, nHidden], -1, 1)
  nn.hoBias = math.ones([nOutputs,1])

  /**
   * Get a prediction based on the current state of the network
   * @param {Array} input
   */
  nn.predict = input => {
    // Output of input through first hidden layer
    const ihOut = nn.feedForward(input, nn.ihWeights, nn.ihBias)
    
    // Output of all other hidden layers
    let hhOut = null
    if(nn.hhWeights.length==0) {
      hhOut = ihOut
    } else {
      hhOut = nn.hhWeights.reduce((acc, weights, i)=> nn.feedForward(acc, weights, nn.hhBias[i]), ihOut)
    }

    // Output of hidden layer through output layer
    return nn.feedForward(hhOut, nn.hoWeights, nn.hoBias)
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
   * Feed the input forward through a layer
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
   * Train the network based on the input and the target
   * @param {*} input 
   * @param {*} target 
   */
  nn.train = (input, target) => {
    // Output of input through first hidden layer
    const ihOut = nn.feedForward(input, nn.ihWeights, nn.ihBias)
    // Output of all other hidden layers
    let hhOuts = []
    let hoOut = null
    if(nn.hhWeights.length==0) {
      hoOut = nn.feedForward(ihOut, nn.hoWeights, nn.hoBias)
    } else {
      nn.hhWeights.forEach((weights, i)=> {
        hhOuts.push(hhOuts.length==0 ? 
          nn.feedForward(ihOut, weights, nn.hhBias[i]) :
          nn.feedForward(hhOuts[i-1], weights, nn.hhBias[i]) )
      })
      hoOut = nn.feedForward(hhOuts[hhOuts.length-1], nn.hoWeights, nn.hoBias)
    }

    // Difference between prediction and target
    const hoOutError = math.subtract(target, hoOut)
    // Derivative of current layers output
    const dhoOut = hoOut.map(row => row.map(nn.dactivation))
    // This particular step requires element wise multiplication
    // gradient = (lr * derivative of feedforward output of current layer * error)
    const hoGradient = math.dotMultiply(math.multiply(dhoOut, nn.lr), hoOutError)
    // delta weights = gradient * transpose(feedforward output of previous layer)
    const hoWeightsDelta = math.multiply(hoGradient, math.transpose(ihOut))

    if(nn.hhWeights.length==0) {
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
    } else {
      const hhGradients = []
      const hhWeightsDeltas = []
      let error = null
      for(let i=nn.hhWeights.length-1; i>=0; i--) {
        // Calculate the contribution of each node toward the error of this layer via their weights
        error = i==nn.hhWeights.length-1 ? 
          math.multiply(math.transpose(nn.hoWeights), hoOutError) :
          math.multiply(math.transpose(nn.hhWeights[i]), error)
        const dOut = hhOuts[i].map(row => row.map(nn.dactivation))
        const gradient = math.dotMultiply(math.multiply(dOut, nn.lr), error)
        const weightsDelta = i==0 ? 
          math.multiply(gradient, math.transpose(ihOut)) :
          math.multiply(gradient, math.transpose(hhOuts[i-1]))

        hhGradients.unshift(gradient)
        hhWeightsDeltas.unshift(weightsDelta)
      }

      const ihOutError = math.multiply(math.transpose(nn.hhWeights[0]), error)
      const dihOut = ihOut.map(row => row.map(nn.dactivation))
      const ihGradient = math.dotMultiply(math.multiply(dihOut, nn.lr), ihOutError)
      const ihWeightsDelta = math.multiply(ihGradient, math.transpose(input))

      // Update weights at the very end so error contribution calculations are accurate
      nn.hoWeights = math.add(nn.hoWeights, hoWeightsDelta)
      // Update bias, the weight of bias is always 1, so the change is only the gradient
      nn.hoBias = math.add(nn.hoBias, hoGradient)

      nn.hhWeights = nn.hhWeights.map((layer, i) => math.add(layer, hhWeightsDeltas[i]))
      nn.hhBias = nn.hhBias.map((layer,i) => math.add(layer, hhGradients[i]))

      nn.ihWeights = math.add(nn.ihWeights, ihWeightsDelta)
      nn.ihBias = math.add(nn.ihBias, ihGradient)
    }
  }

  return nn
}