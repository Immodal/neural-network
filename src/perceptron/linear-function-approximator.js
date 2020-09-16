/**
 * Self-contained demo using Perceptrons for approximating a function
 * @param {Number} w Width of Canvas
 * @param {Number} h Height of Canvas
 */
LinearFunctionApproximator = (w, h) => {
  const lfa = DemoBase()
  lfa.initialized = false
  lfa.w = w
  lfa.h = h
  lfa.DEFAULT_SAMPLES = 1000
  lfa.DEFAULT_SLOPE = 1
  lfa.DEFAULT_INTERCEPT = 0
  lfa.DEFAULT_LR = 0.01

  /**
   * Initialize the approximator
   * @param {Object} p Object that is passed into the sketch function
   */
  lfa.init = p => {
    lfa.canvas = p.createCanvas(lfa.w, lfa.h)
    lfa.canvas.parent("#cv")

    lfa.viewDiv = lfa.makeDiv(p, "#main", "")
    lfa.valuesDiv = lfa.makeDiv(p, lfa.viewDiv, "Values")
    lfa.settingsDiv = lfa.makeDiv(p, lfa.viewDiv, "Settings")
    lfa.sInput = lfa.makeInputGroup(p, lfa.settingsDiv, 'Slope [-1000,1000]: ', lfa.DEFAULT_SLOPE, lfa.updateNumberInput(-1000, 1000, lfa.DEFAULT_SLOPE))
    lfa.iInput = lfa.makeInputGroup(p, lfa.settingsDiv, 'Intercept [-1,1]: ', lfa.DEFAULT_INTERCEPT, lfa.updateNumberInput(-1, 1, lfa.DEFAULT_INTERCEPT))
    lfa.lrInput = lfa.makeInputGroup(p, lfa.settingsDiv, 'Learning Rate [0,1]: ', lfa.DEFAULT_LR, lfa.updateNumberInput(0, 1, lfa.DEFAULT_LR))
    lfa.nSlider = lfa.makeSliderGroup(p, lfa.settingsDiv, 'N Samples [100, 5000]: ', 100, 5000, lfa.DEFAULT_SAMPLES, 100)
    lfa.initialized = true

    lfa.restart()
    lfa.xWeightLabel = lfa.makeDataLabel(p, lfa.valuesDiv, "X (Input 0) Weight: ", lfa.perceptron.weights[0])
    lfa.yWeightLabel = lfa.makeDataLabel(p, lfa.valuesDiv, "Y (Input 1) Weight: ", lfa.perceptron.weights[1])
    lfa.biasWeightLabel = lfa.makeDataLabel(p, lfa.valuesDiv, "Intercept (Bias) Weight: ", lfa.perceptron.biasWeight)
    lfa.nSamplesLabel = lfa.makeDataLabel(p, lfa.valuesDiv, "Samples Processed: ", lfa.points.length)
  }

  /**
   * Quit the approximator and clear everything associated with it
   */
  lfa.quit = () => {
    lfa.restart()
    lfa.canvas.remove()
    lfa.viewDiv.remove()
    lfa.initialized = false
  }

  /**
   * Restart the approximator
   */
  lfa.restart = () => {
    lfa.perceptron = Perceptron(2, Number(lfa.lrInput.value()))
    lfa.setLineFunction(Number(lfa.sInput.value()), Number(lfa.iInput.value()))
    lfa.points = []
  }

  /**
   * Set fa.f to be a function that returns the result of y = mx + c
   * @param {Number} m Slope of line
   * @param {Number} c Intercept of line
   */
  lfa.setLineFunction = (m, c) => {
    lfa.f = x => m * x + c
  }

  /**
   * Update Data Labels for Perceptron Input Weights
   */
  lfa.updateWeightLabels = () => {
    lfa.xWeightLabel.html(lfa.perceptron.weights[0])
    lfa.yWeightLabel.html(lfa.perceptron.weights[1])
    lfa.biasWeightLabel.html(lfa.perceptron.biasWeight)
    lfa.nSamplesLabel.html(lfa.points.length)
  }

  /**
   * Draw function to be called by sketch.js
   * @param {Object} p Object that is passed into the sketch function
   * @param {Number} r Radius of Circle when drawing Point
   * @param {Int} n Number of Points to generate for training
   */
  lfa.draw = (p, r=15) => {
    const w = lfa.w/2
    const h = lfa.h/2

    p.translate(w, h)
    p.background(255)

    lfa.updateWeightLabels()
    p5Perceptron.draw(p, lfa.perceptron, w, h, lfa.f)
    p5Point.drawPoints(p, lfa.points, w, h, r, lfa.perceptron)

    if(lfa.points.length < lfa.nSlider.value()) {
      let pt = Point(lfa.f)
      lfa.perceptron.train(pt.coords, pt.label)
      lfa.points.push(pt)
    }
  }

  return lfa
}