/**
 * Perceptron Factory
 */
Perceptron = (nInputs, learningRate) => {
  const pn = {}

  pn.weights = Array.from(Array(nInputs), () => Math.random())
  pn.biasWeight = Math.random()
  pn.bias = 1
  pn.lr = learningRate

  /**
   * Get a guess on the label based on the current state of the Perceptron
   * @param {Array} inputs 1D Array of all input values 
   */
  pn.guess = inputs => {
    value = inputs
        .map((v,i) => v * pn.weights[i])
        .reduce((acc, v) => acc + v)
    return pn.activation(value + pn.bias * pn.biasWeight)
  }

  /**
   * Activation function
   * @param {Number} x 
   */
  pn.activation = x => x >= 0 ? 1 : -1

  /**
   * Train the Perceptron based in a given 1D array of inputs
   * @param {Array} input 1D Array of all input values 
   * @param {Number} target the correct value that that Perceptron should output
   */
  pn.train = (input, target) => {
    error = target - pn.guess(input)
    pn.weights = pn.weights.map((w,i) => w + (error * input[i] * pn.lr))
    pn.biasWeight += error * pn.bias * pn.lr
  }

  return pn
}

/**
 * Draw functions for Perceptron
 */
p5Perceptron = {
  draw: (p, pn, w, h, lf) => {
    // Y coordinates will be inverted so that the origin starts from bottom
    const drawLine = f => p.line(-w, -f(-1)*h, w, -f(1)*h)

    p5Perceptron.drawAxis(p, w, h)
    p.strokeWeight(5)
    // Draw target line
    p.stroke(100)
    drawLine(lf)
    // Draw Perceptron line
    p.stroke(0, 0, 255)
    // Function derived from x * wx + y * wy + bias * wbias = 0, solving for y
    drawLine(x => - pn.weights[0]/pn.weights[1] * x - pn.biasWeight/pn.weights[1])
  },

  /**
   * Draw X and Y axis
   */
  drawAxis: (p, w, h) => {
    p.stroke(0)
    p.strokeWeight(2)
    p.line(-w, 0, w, 0)
    p.line(0, -h, 0, h)
  }
}