/**
 * Self-contained demo using NeuralNetwork for approximating basic logic
 * @param {Number} w Width of Canvas
 * @param {Number} h Height of Canvas
 */
LogicApproximator = (w, h) => {
  const la = DemoBase()
  la.initialized = false
  la.go = true
  la.w = w
  la.h = h
  la.LR_MIN = 0
  la.LR_MAX = 1
  la.DEFAULT_N_HIDDEN_LAYER_NODES = 4
  la.DEFAULT_LR = 0.1
  la.DEFAULT_SAMPLES = 50
  la.data = [
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

    la.descriptionDiv = la.makeDiv(p, "#main", "Description")
    la.descriptionDiv.size(300, p.AUTO)
    p.createP("" +
      "This demo attempts to approximate the values found in the \"Logic\" section with a neural network. " +
      "The neural network consists of 4 input nodes, 1 hidden layer with 4 (default) hidden nodes and 1 output node.")
      .parent(la.descriptionDiv)
    p.createP("" +
      "The canvas represents a cartesian plane where the X and Y axis goes from 0 to 1. " +
      "It is also split into \"pixels\" where their positions on the plane are fed into the neural network. " +
      "The neural network then outputs a value between 0 and 1 which translates into the brightness of the \"pixel\". " +
      "0 is black and 1 is white. " + 
      "This is meant to indicate how the network responds all values within the range of the canvas.")
      .parent(la.descriptionDiv)
    p.createP("" +
      "While a simple Perceptron is able to handle linearly separable function such as the AND and OR logic, additional nodes " +
      "are needed in order to handle non-linear functions like XOR and XNOR. " +
      "Convergence generally occurs after processing around 5000 samples.")
      .parent(la.descriptionDiv)

    la.viewDiv = la.makeDiv(p, "#main", "")
    la.logicDiv = la.makeDiv(p, la.viewDiv, "Logic")
    la.logic00Input = la.makeInputGroup(p, la.logicDiv, 
      `X=${la.data[0].inputs[0][0]}, Y=${la.data[0].inputs[1][0]}, Result [0,1]: `, la.data[0].outputs[0][0])
    la.logic10Input = la.makeInputGroup(p, la.logicDiv, 
      `X=${la.data[1].inputs[0][0]}, Y=${la.data[1].inputs[1][0]}, Result [0,1]: `, la.data[1].outputs[0][0])
    la.logic01Input = la.makeInputGroup(p, la.logicDiv, 
      `X=${la.data[2].inputs[0][0]}, Y=${la.data[2].inputs[1][0]}, Result [0,1]: `, la.data[2].outputs[0][0])
    la.logic11Input = la.makeInputGroup(p, la.logicDiv, 
      `X=${la.data[3].inputs[0][0]}, Y=${la.data[3].inputs[1][0]}, Result [0,1]: `, la.data[3].outputs[0][0], la.updateLogic)

    la.settingsDiv = la.makeDiv(p, la.viewDiv, "Settings")
    la.restartBtn = p.createButton('Restart')
    la.restartBtn.parent(la.settingsDiv)
    la.restartBtn.mousePressed(la.restart)
    la.startBtn = p.createButton('Start')
    la.startBtn.parent(la.settingsDiv)
    la.startBtn.mousePressed(()=>{ la.go = true })
    la.pauseBtn = p.createButton('Pause')
    la.pauseBtn.parent(la.settingsDiv)
    la.pauseBtn.mousePressed(()=>{ la.go = false })
    la.nSamplesLabel = la.makeDataLabel(p, la.settingsDiv, "Samples Processed: ", 0)
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
    la.descriptionDiv.remove()
    la.viewDiv.remove()
    la.initialized = false
  }

  /**
   * Restart
   */
  la.restart = () => {
    la.go = true
    la.nSamples = 0
    la.nn = NeuralNetwork(2, parseInt(la.nHiddenNodesInput.value()), 1, parseFloat(la.lrInput.value()))
  }

  /**
   * Draw function to be called by sketch.js
   * @param {Object} p Object that is passed into the sketch function
   */
  la.draw = p => {
    if(la.go) {
      const resolution = 10

      p.translate(0, la.h-resolution)
      p.background(0)

      la.train(la.DEFAULT_SAMPLES)
  
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
          p.rect(i * resolution, -j * resolution, resolution, resolution)
        }
      }
  
      la.updateLabels()
    }
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
   * Verify input value and then update logic
   */
  la.updateLogic = () => {
    la.updateNumberInput(0, 1, la.data[0].outputs[0][0], false, false)(la.logic00Input)
    la.data[0].outputs[0][0] = la.logic00Input.value()

    la.updateNumberInput(0, 1, la.data[1].outputs[0][0], false, false)(la.logic01Input)
    la.data[1].outputs[0][0] = la.logic01Input.value()

    la.updateNumberInput(0, 1, la.data[2].outputs[0][0], false, false)(la.logic10Input)
    la.data[2].outputs[0][0] = la.logic10Input.value()

    la.updateNumberInput(0, 1, la.data[3].outputs[0][0], false, false)(la.logic11Input)
    la.data[3].outputs[0][0] = la.logic11Input.value()
  }

  /**
   * Train the Neural Network
   * @param {Int} n Number of samples to train on
   */
  la.train = n => {
    la.nSamples += n
    for (let i = 0; i < n; i++) {
      const data = la.data[math.randomInt(0, la.data.length)]
      la.nn.train(data.inputs, data.outputs)
    }
  }

  return la
}