
/**
 * Self-contained demo using NeuralNetwork for recognizing digits
 * @param {Number} w Width of Canvas
 * @param {Number} h Height of Canvas
 */
DigitRecognition = (w, h) => {
  const drec = DemoBase()
  drec.DEV = true
  drec.initialized = false
  drec.w = w
  drec.h = h
  drec.LR_MIN = 0
  drec.LR_MAX = 1
  drec.DEFAULT_LR = 0.01
  drec.DEFAULT_N_HIDDEN_LAYERS = 1
  drec.DEFAULT_N_HIDDEN_LAYER_NODES = 28
  drec.TYPE_IMAGE = "image"
  drec.TYPE_LABEL = "label"

  /**
   * Initialize
   * @param {Object} p Object that is passed into the sketch function
   */
  drec.init = p => {
    drec.viewDiv = drec.makeDiv(p, "#main", "")
    
    drec.trainDiv = drec.makeDiv(p, drec.viewDiv, "Training")

    drec.trainImInput = drec.makeFileInputGroup(p, drec.trainDiv, "Training Images: ", drec.loadFile(drec.TYPE_IMAGE, false))
    drec.trainLblInput = drec.makeFileInputGroup(p, drec.trainDiv, "Training Labels: ", drec.loadFile(drec.TYPE_LABEL, false))
    drec.testImInput = drec.makeFileInputGroup(p, drec.trainDiv, "Testing Images: ", drec.loadFile(drec.TYPE_IMAGE, true))
    drec.testLblInput = drec.makeFileInputGroup(p, drec.trainDiv, "Testing Labels: ", drec.loadFile(drec.TYPE_LABEL, true))

    drec.nHiddenNodesInput = drec.makeInputGroup(p, drec.trainDiv, 
      'N Nodes Per Hidden Layer [1,100]: ', drec.DEFAULT_N_HIDDEN_LAYER_NODES, drec.restart)
    drec.nHiddenLayersInput = drec.makeInputGroup(p, drec.trainDiv, 
      'N Hidden Layers [1,10]: ', drec.DEFAULT_N_HIDDEN_LAYERS, drec.restart)

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

    if (!drec.DEV) drec.trainDiv.hide()

    drec.restart()
    drec.initialized = true
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
   * @param {Integer} reportingInterval Number of records to count before logging progress
   */
  drec.train = (reportingInterval=10000) => {
    const order = Utils.range(drec.trainData.length)
    Utils.shuffle(order)

    console.log(`Training Start, ${new Date().toUTCString()}`)
    for(let i=0 ; i<order.length; i++) {
      const input = NeuralNetwork.arrayToInput(drec.trainData[order[i]])
      const target = Array.from(Array(10), () => [0])
      target[drec.trainLabels[order[i]]] = [1]

      drec.nn.train(input, target)
      if(reportingInterval>0 && i % reportingInterval == 0) {
        console.log("Index: " + i + ", Time: " + new Date().toUTCString())
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
   * Quit and clear everything associated with it
   * @param {Object} p Object that is passed into the sketch function
   */
  drec.quit = p => {
    drec.restart()
    //drec.canvas.remove()
    drec.viewDiv.remove()
    drec.initialized = false
  }

  /**
   * Restart
   */
  drec.restart = () => {
    drec.nn = NeuralNetwork.construct(784, 
      parseInt(drec.nHiddenNodesInput.value()), 
      parseInt(drec.nHiddenLayersInput.value()), 
      10, 
      parseFloat(drec.lrInput.value()))
  }

  /**
   * Draw function to be called by sketch.js
   * @param {Object} p Object that is passed into the sketch function
   */
  drec.draw = p => {
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