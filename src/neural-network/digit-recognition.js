
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
    drec.viewDiv = drec.makeDiv(p, "#main", "")

    drec.settingsDiv = drec.makeDiv(p, drec.viewDiv, "Settings")
    drec.nHiddenNodesInput = drec.makeInputGroup(p, drec.settingsDiv, 
      'N Nodes Per Hidden Layer [1,100]: ', drec.DEFAULT_N_HIDDEN_LAYER_NODES, drec.restart)
    drec.nHiddenLayersInput = drec.makeInputGroup(p, drec.settingsDiv, 
      'N Hidden Layers [1,10]: ', drec.DEFAULT_N_HIDDEN_LAYERS, drec.restart)
    drec.lrInput = drec.makeInputGroup(p, drec.settingsDiv, 
      'Learning Rate [0,1]: ', drec.DEFAULT_LR, drec.updateLearningRate)
    
    drec.filesDiv = drec.makeDiv(p, drec.viewDiv, "File Upload")
    drec.makeFileInputGroup(p, drec.filesDiv, "Training Images: ", drec.loadFile(drec.TYPE_IMAGE, false))
    drec.makeFileInputGroup(p, drec.filesDiv, "Training Labels: ", drec.loadFile(drec.TYPE_LABEL, false))
    drec.makeFileInputGroup(p, drec.filesDiv, "Testing Images: ", drec.loadFile(drec.TYPE_IMAGE, true))
    drec.makeFileInputGroup(p, drec.filesDiv, "Testing Labels: ", drec.loadFile(drec.TYPE_LABEL, true))

    drec.restart()
    drec.initialized = true
  }

  drec.train = (epochs=1, runTest=false) => {
    const order = Utils.range(drec.trainData.length)
    Utils.shuffle(order)
    console.log(`Training Start, ${new Date().toUTCString()}`)
    for(let j=0; j<epochs; j++) {
      for(let i=0 ; i<order.length; i++) {
        const input = NeuralNetwork.arrayToInput(drec.trainData[order[i]])
        const target = Array.from(Array(10), () => [0])
        target[drec.trainLabels[order[i]]] = [1]

        drec.nn.train(input, target)
        if(i % 10000 == 0) {
          console.log("Epoch: " + j + ", Index: " + i + ", Time: " + new Date().toUTCString())
        }
      }
      if(runTest) drec.test()
    }
    console.log(`Training Ended, ${new Date().toUTCString()}`)
  }

  drec.test = () => {
    let nCorrect = 0
    for(let i=0 ; i<drec.testData.length; i++) {
      const input = NeuralNetwork.arrayToInput(drec.testData[i])
      const target = drec.testLabels[i]

      const result = drec.nn.predict(input).reduce((iMax, x, i, arr) => x[0] > arr[iMax] ? i : iMax, 0)
      nCorrect += result == target ? 1 : 0
      if(i % 1000 == 0) {
        console.log(`Testing at index ${i}, ${nCorrect} correct.`)
      }
    }
    console.log(`Done, nCorrect: ${nCorrect}, Score: ${nCorrect/(i+1)}`)
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
   * @param {*} file 
   */
  drec.loadFile = (targetType, isTestData) => async p5File => {
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
  }

  return drec
}