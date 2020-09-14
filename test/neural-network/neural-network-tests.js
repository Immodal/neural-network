NeuralNetworkTests = {
  "toInput": () => {
    const nn = NeuralNetwork(3, 2, 1)
    const arr = [1,2,3]
    const exp = [[1],[2],[3]]
    nn.toInput(arr).forEach((row, i) => {
      eq(exp[i].length, row.length)
      row.forEach((x, j) => eq(exp[i][j], x))
    })
  },

  "feedForward": () => {
    const nn = NeuralNetwork(3, 2, 2)

    // Check calculations are correct
    const input = nn.toInput([1,1,1])
    nn.ihWeights = [[0.9,0.8,0.7],[0.6,0.5,0.4]]
    const output = nn.feedForward(input, nn.ihWeights, nn.ihBias)
    const exp = [0.9677, 0.9241]
    output.forEach((x, i) => eq(math.round(x[0], 4), exp[i]))
    // Check output is expected shape
    output.forEach(x => eq(1, x.length))
    eq(nn.ihWeights.length, output.length)
    eq(1, output[0].length)

    // Check calculations are correct
    const input2 = nn.toInput([1,1])
    nn.hoWeights = [[0.9,0.8],[0.6,0.5]]
    const output2 = nn.feedForward(input2, nn.hoWeights, nn.hoBias)
    const exp2 = [0.9370, 0.8909]
    output2.forEach((x, i) => eq(math.round(x[0], 4), exp2[i]))
    // Check output is expected shape
    output2.forEach(x => eq(1, x.length))
    eq(nn.hoWeights.length, output2.length)
    eq(1, output2[0].length)
  },

  "predict": () => {
    let nn = NeuralNetwork(3, 2, 1)
    let input = nn.toInput([1,1,1])
    nn.ihWeights = [[0.9,0.8,0.7],[0.6,0.5,0.4]]
    nn.hoWeights = [[0.9,0.8]]
    let output = nn.predict(input)
    eq(nn.hoWeights.length, output.length)
    output.forEach(x => eq(1, x.length))
    eq(0.9315, math.round(output[0][0], 4))

    nn = NeuralNetwork(3, 2, 2)
    nn.ihWeights = [[0.9,0.8,0.7],[0.6,0.5,0.4]]
    nn.hoWeights = [[0.9,0.8],[0.6,0.5]]
    output = nn.predict(input)
    eq(nn.hoWeights.length, output.length)
    output.forEach(x => eq(1, x.length))
    eq(0.9315, math.round(output[0][0], 4))
    eq(0.8852, math.round(output[1][0], 4))
  },

  "train": () => {
    let nn = NeuralNetwork(3, 2, 1)
    let input = nn.toInput([1,-1,1])
    let target = nn.toInput([0.5])
    nn.ihWeights = [[0.9,-0.8,0.7],[0.6,0.5,-0.4]]
    nn.hoWeights = [[-0.9,0.8]]
    
    nn.train(input, target)

    const ihWeightsExp = [[0.8835, -0.7835, 0.6835], [0.6112, 0.4888, -0.3888]]
    ihWeightsExp.forEach((row, i) => row.map((x, j) => eq(x, math.round(nn.ihWeights[i][j], 4))))
    const ihBiasExp = [[0.9835], [1.0112]]
    ihBiasExp.forEach((row, i) => row.map((x, j) => eq(x, math.round(nn.ihBias[i][j], 4))))
    const hoWeightsExp = [[-0.8870, 0.8090]]
    hoWeightsExp.forEach((row, i) => row.map((x, j) => eq(x, math.round(nn.hoWeights[i][j], 4))))
    const hoBiasExp = [[1.0134]]
    hoBiasExp.forEach((row, i) => row.map((x, j) => eq(x, math.round(nn.hoBias[i][j], 4))))
  },
}