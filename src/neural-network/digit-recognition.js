
/**
 * Self-contained demo using NeuralNetwork for recognizing digits
 * @param {Number} w Width of Canvas
 * @param {Number} h Height of Canvas
 */
DigitRecognition = (w, h) => {
  const drec = DemoBase()
  drec.initialized = false
  drec.w = w
  drec.h = h
  drec.LR_MIN = 0
  drec.LR_MAX = 1
  drec.DEFAULT_LR = 0.01
  drec.DEFAULT_N_HIDDEN_LAYERS = 1
  drec.DEFAULT_N_HIDDEN_LAYER_NODES = 20
  drec.TYPE_IMAGE = "image"
  drec.TYPE_LABEL = "label"

  /**
   * Initialize
   * @param {Object} p Object that is passed into the sketch function
   */
  drec.init = p => {
    drec.canvas = p.createCanvas(drec.w, drec.h)
    drec.canvas.parent("#cv")
    drec.userDigit = p.createGraphics(drec.w, drec.h)
    drec.userDigit.pixelDensity(1)

    drec.viewDiv = drec.makeDiv(p, "#main", "Testing")
    drec.viewDiv.size(350, p.AUTO)
    p.createP("Draw a number between 0 and 9 on the black canvas and see what the Neural Network thinks it is. The number should be a decent size relative to the canvas.")
      .parent(drec.viewDiv)
    p.createP("The default network has 784 inputs, 2 hidden layers with 88 nodes each, and 10 output nodes. It managed to achieve 95% accuracy on the MNIST test set. This is not a convolutional network.")
      .parent(drec.viewDiv)
    drec.clearBtn = drec.makeButton(p, drec.viewDiv, "Clear Canvas", 
      () => { 
        drec.userDigit.background(0)
        drec.numConfLabels.forEach(lbl => lbl.html("N/A"))
      }
    )
    drec.predPara1 = p.createP()
    drec.predPara1.parent(drec.viewDiv)
    drec.predPara2 = p.createP()
    drec.predPara2.parent(drec.viewDiv)
    drec.numConfLabels = []
    for (let i=0; i<10; i++) {
      const parent = i<5 ? drec.predPara1 :  drec.predPara2
      drec.numConfLabels.push(drec.makeDataLabel(p, parent, `${i}: `, "N/A", inline=true))
      p.createSpan(", ").parent(parent)
    }
    drec.brushSlider = drec.makeSliderGroup(p, drec.viewDiv, "Brush Size: ", 20, 80, 40, 5)
    drec.devCb = drec.makeCheckbox(p, drec.viewDiv, 'Show Dev Tools', () => {
      if (!drec.devCb.checked()) drec.trainDiv.hide()
      else drec.trainDiv.show()
    })
    
    // Start Training Div
    drec.trainDiv = drec.makeDiv(p, "#main", "Developer Tools")
    drec.trainImInput = drec.makeFileInputGroup(p, drec.trainDiv, "Training Images: ", drec.loadFile(drec.TYPE_IMAGE, false))
    drec.trainLblInput = drec.makeFileInputGroup(p, drec.trainDiv, "Training Labels: ", drec.loadFile(drec.TYPE_LABEL, false))
    drec.testImInput = drec.makeFileInputGroup(p, drec.trainDiv, "Testing Images: ", drec.loadFile(drec.TYPE_IMAGE, true))
    drec.testLblInput = drec.makeFileInputGroup(p, drec.trainDiv, "Testing Labels: ", drec.loadFile(drec.TYPE_LABEL, true))
    drec.nHiddenNodesInput = drec.makeInputGroup(p, drec.trainDiv, 
      'N Nodes Per Hidden Layer [1,100]: ', drec.DEFAULT_N_HIDDEN_LAYER_NODES, drec.makeCustomNN)
    drec.nHiddenLayersInput = drec.makeInputGroup(p, drec.trainDiv, 
      'N Hidden Layers [1,10]: ', drec.DEFAULT_N_HIDDEN_LAYERS, drec.makeCustomNN)
    drec.loadNNButtonP = p.createP("Load NN from JSON: ")
    drec.loadNNButtonP.parent(drec.trainDiv)
    drec.loadNNInput = p.createElement('textarea')
    drec.loadNNInput.parent(drec.trainDiv)
    drec.loadNNInput.attribute("rows", 5)
    drec.loadNNInput.attribute("cols", 50)
    drec.makeButton(p, drec.loadNNButtonP, "Deserialize", drec.loadNN)
    drec.lrInput = drec.makeInputGroup(p, drec.trainDiv, 
      'Learning Rate [0,1]: ', drec.DEFAULT_LR, drec.updateLearningRate)
    drec.saveNNButtonP = p.createP("Serialize and print NN to Dev Console: ")
    drec.saveNNButtonP.parent(drec.trainDiv)
    drec.makeButton(p, drec.saveNNButtonP, "Serialize", drec.saveNN)
    drec.trainDiv.hide()
    // End Training Div

    drec.restart()
    drec.initialized = true
  }

  /**
   * Restart
   */
  drec.restart = () => {
    drec.nn = NeuralNetwork.deserialize(JSON.parse(defaultNN))
  }

  /**
   * Draw function to be called by sketch.js
   * @param {Object} p Object that is passed into the sketch function
   */
  drec.draw = p => {
    p.background(0)
    drec.userDigit.get().resize(28, 28)
    p.image(drec.userDigit, 0, 0)
    if (p.mouseIsPressed) {
      drec.userDigit.fill(255)
      drec.userDigit.stroke(255)
      drec.userDigit.strokeWeight(parseInt(drec.brushSlider.value()))
      drec.userDigit.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY)
    }

    drec.guessUserDigit()
  }

  /**
   * Quit and clear everything associated with it
   * @param {Object} p Object that is passed into the sketch function
   */
  drec.quit = p => {
    drec.restart()
    drec.canvas.remove()
    drec.viewDiv.remove()
    drec.trainDiv.remove()
    drec.initialized = false
  }

  /**
   * Provide a guess on what the neural network thinks the currently drawn number is
   */
  drec.guessUserDigit = () => {
    let img = drec.userDigit.get()
    img.resize(28, 28)
    img.loadPixels()
    let input = []
    for (let i = 0; i < 784; i++) {
      // img is in RGBA, we only use R values because image is grayscale
      input.push([img.pixels[i * 4] / 255])
    }
    let predictions = drec.nn.predict(input)
    let max = 0
    let maxInd = -1
    drec.numConfLabels.forEach((lbl, i) => {
      const conf = predictions[i][0]
      lbl.html(`${(conf*100).toFixed(2)}%`)
      lbl.style('color', '#000000')
      if(conf>=max) {
        max = conf
        maxInd = i
      }
    })
    drec.numConfLabels[maxInd].style('color', '#00bb00')
  }

  /**
   * Override NN with a new one based on current dev tool settings
   */
  drec.makeCustomNN = () => {
    drec.nn = NeuralNetwork.construct(784, 
      parseInt(drec.nHiddenNodesInput.value()), 
      parseInt(drec.nHiddenLayersInput.value()), 
      10, 
      parseFloat(drec.lrInput.value()))
  }

  /**
   * Trains the current Neural Network and then tests it automatically for a given number of epochs
   * @param {Integer} epochs Number of times to run the entire training dataset through the neural network
   */
  drec.trainTest = epochs => {
    console.log(`Getting baseline score...`)
    let best = drec.test()

    for(let j=0; j<epochs; j++) {
      console.log("Epoch: " + j)
      drec.train()

      const score = drec.test()
      if (score > best) {
        console.log(`Network is best so far! Old: ${best}, New: ${score}`)
        drec.saveNN()
        best = score
      }
    }
  }

  /**
   * Train the current Neural Network on the training data
   * @param {Integer} reportingInterval Minimum number of records to count before logging progress
   */
  drec.train = (batchSize=100, reportingInterval=10000) => {
    const order = Utils.range(drec.trainData.length)
    Utils.shuffle(order)

    console.log(`Training Start, ${new Date().toUTCString()}`)
    let reportCounter = 0
    for(let i=0 ; i<order.length; i+=batchSize) {
      // Create batch
      let inputs = []
      let targets = []
      for(let j=0; j<batchSize; j++) {
        inputs.push(
          // Normalize inputs
          NeuralNetwork.arrayToInput(math.divide(drec.trainData[order[i+j]], 255))
        )
        targets.push(Array.from(Array(10), () => [0]))
        targets[targets.length-1][drec.trainLabels[order[i+j]]] = [1]
        reportCounter += 1
      }

      drec.nn.trainBatch(inputs, targets)
      if(reportingInterval>0 && reportCounter > reportingInterval) {
        console.log("Index: " + i + ", Time: " + new Date().toUTCString())
        reportCounter = 0
      }
    }
    console.log(`Training Ended, ${new Date().toUTCString()}`)
  }

  /**
   * Test the current Neural Network on the test data
   * @param {Integer} reportingInterval Number of records to count before logging progress
   */
  drec.test = (reportingInterval=5000) => {
    let nCorrect = 0
    for(let i=0 ; i<drec.testData.length; i++) {
      const input = NeuralNetwork.arrayToInput(drec.testData[i])
      const target = drec.testLabels[i]

      const result = drec.nn.predict(input).reduce((iMax, x, i, arr) => x[0] > arr[iMax] ? i : iMax, 0)
      nCorrect += result == target ? 1 : 0
      if(i % reportingInterval == 0) {
        console.log(`Testing at index ${i}, ${nCorrect} correct.`)
      }
    }

    const score = nCorrect/drec.testData.length
    console.log(`Done, nCorrect: ${nCorrect}, Score: ${score}`)
    return score
  }

  /**
   * Verify input value and then update learning rate
   */
  drec.updateLearningRate = () => {
    drec.updateNumberInput(drec.LR_MIN, drec.LR_MAX, drec.DEFAULT_LR, false, false)(drec.lrInput)
    drec.nn.lr = parseFloat(drec.lrInput.value())
  }

  /**
   * 
   */
  drec.saveNN = () => console.log(NeuralNetwork.serialize(drec.nn))

  /**
   * 
   */
  drec.loadNN = () => {
    try {
      let data = JSON.parse(drec.loadNNInput.value());

      // https://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try
      // Handle non-exception-throwing cases:
      // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
      // but... JSON.parse(null) returns null, and typeof null === "object", 
      // so we must check for that, too. Thankfully, null is falsey, so this suffices:
      if (data && typeof data === "object") {
        drec.nn = NeuralNetwork.deserialize(data)
      } else throw new Error("Invalid format for JSON.parse()")
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 
   * @param {*} targetType 
   * @param {*} isTestData 
   */
  drec.loadFile = (targetType, isTestData) => async p5File => {
    try {
      let buffer = await p5File.file.arrayBuffer();
      let headerCount = 4;
      let headerView = new DataView(buffer, 0, 4 * headerCount);
      let headers = new Array(headerCount).fill().map((_, i) => headerView.getUint32(4 * i, false));
    
      // Get file type from the magic number
      let type, dataLength;
      if(headers[0] == 2049) {
        type = drec.TYPE_LABEL;
        dataLength = 1;
        headerCount = 2;
      } else if(headers[0] == 2051) {
        type = drec.TYPE_IMAGE;
        dataLength = headers[2] * headers[3];
      } else throw new Error("Unknown file type " + headers[0])
    
      let data = new Uint8Array(buffer, headerCount * 4);
      if(type == targetType && type == drec.TYPE_IMAGE) {
        dataArr = [];
        for(let i = 0; i < headers[1]; i++) {
          dataArr.push(Array.from(data.subarray(dataLength * i, dataLength * (i + 1))));
        }
        // Save
        if(isTestData) {
          drec.testData = dataArr;
        } else {
          drec.trainData = dataArr;
        }
      } else if(type == targetType && type == drec.TYPE_LABEL) {
        // Save 
        if(isTestData) {
          drec.testLabels = data;
        } else {
          drec.trainLabels = data;
        }
      } else throw new Error("Incorrect file type, should be " + targetType)
    } catch (e) {
      console.log(e)
      if (targetType == drec.TYPE_IMAGE) {
        if (isTestData) drec.testImInput.value("")
        else drec.trainImInput.value("")
      } else if (targetType == drec.TYPE_LABEL) {
        if (isTestData) drec.testLblInput.value("")
        else drec.trainLblInput.value("")
      }
    }
  }

  return drec
}