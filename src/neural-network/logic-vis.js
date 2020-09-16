/**
 * Self-contained demo using NeuralNetwork for approximating basic logic
 * @param {Number} w Width of Canvas
 * @param {Number} h Height of Canvas
 */
LogicApproximator = (w, h) => {
  const la = DemoBase()
  la.initialized = false
  la.w = w
  la.h = h
  la.LR_MIN = 0
  la.LR_MAX = 1
  la.DEFAULT_N_HIDDEN_LAYER_NODES = 4
  la.DEFAULT_LR = 0.1
  la.DEFAULT_SAMPLES = 100
  la.xorData = [
    { inputs: [[0], [0]], outputs: [[0]] },
    { inputs: [[0], [1]], outputs: [[1]] },
    { inputs: [[1], [0]], outputs: [[1]] },
    { inputs: [[1], [1]], outputs: [[0]] }
  ]

  /**
   * Initialize
   * @param {Object} p Object that is passed into the sketch function
   */
  la.init = p => {
    la.canvas = p.createCanvas(la.w, la.h)
    la.canvas.parent("#cv")

    la.viewDiv = la.makeDiv(p, "#main", "")

    la.valuesDiv = la.makeDiv(p, la.viewDiv, "Values")
    la.restartBtn = p.createButton('Restart')
    la.restartBtn.parent(la.valuesDiv)
    la.restartBtn.mousePressed(la.restart)
    la.nSamplesLabel = la.makeDataLabel(p, la.valuesDiv, "Samples Processed: ", 0)

    la.settingsDiv = la.makeDiv(p, la.viewDiv, "Settings")
    la.nHiddenNodesInput = la.makeInputGroup(p, la.settingsDiv, 
      'N Nodes Per Hidden Layer [1,100]: ', la.DEFAULT_N_HIDDEN_LAYER_NODES, la.restart)
    la.lrInput = la.makeInputGroup(p, la.settingsDiv, 
      'Learning Rate [0,1]: ', la.DEFAULT_LR, la.updateLearningRate)
    
    la.restart()
    la.initialized = true
  }

  /**
   * Quit and clear everything associated with it
   * @param {Object} p Object that is passed into the sketch function
   */
  la.quit = p => {
    la.restart()
    la.canvas.remove()
    la.viewDiv.remove()
    la.initialized = false
  }

  /**
   * Restart
   */
  la.restart = () => {
    la.nSamples = 0
    la.nn = NeuralNetwork(2, parseInt(la.nHiddenNodesInput.value()), 1, parseFloat(la.lrInput.value()))
  }

  /**
   * Draw function to be called by sketch.js
   * @param {Object} p Object that is passed into the sketch function
   */
  la.draw = p => {
    p.background(0)

    la.train(la.DEFAULT_SAMPLES)

    const resolution = 10
    const cols = la.w / resolution
    const rows = la.h / resolution
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x1 = i / cols
        const x2 = j / rows
        const inputs = [[x1], [x2]]
        const y = la.nn.predict(inputs)
        p.noStroke()
        p.fill(y * 255)
        p.rect(i * resolution, j * resolution, resolution, resolution)
      }
    }

    la.updateLabels()
  }

  /**
   * Update Data Labels for Perceptron Input Weights
   */
  la.updateLabels = () => {
    la.nSamplesLabel.html(la.nSamples)
  }

  /**
   * Verify input value and then update learning rate
   */
  la.updateLearningRate = () => {
    la.updateNumberInput(la.LR_MIN, la.LR_MAX, la.DEFAULT_LR, false, false)(la.lrInput)
    la.nn.lr = parseFloat(la.lrInput.value())
  }

  /**
   * Train the Neural Network
   * @param {Int} n Number of samples to train on
   */
  la.train = n => {
    la.nSamples += n
    for (let i = 0; i < n; i++) {
      const data = la.xorData[Utils.randInt(0, la.xorData.length-1)];
      la.nn.train(data.inputs, data.outputs);
    }
  }

  return la
}