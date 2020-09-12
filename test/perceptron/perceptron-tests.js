PerceptronTests = {
  'init': () => {
    const nInputs = 3
    const learningRate = 0.1

    const pn = Perceptron(nInputs, learningRate)

    eq(nInputs, pn.weights.length)
    eq(learningRate, pn.lr)
  },

  'activation': () => {
    const pn = Perceptron(2, 0.1)

    eq(1, pn.activation(0.00001))
    eq(-1, pn.activation(-0.00001))
  },

  'guess': () => {
    const pn = Perceptron(2, 0.1)

    pn.weights[0] = 1
    pn.weights[1] = 1
    pn.biasWeight = 1

    eq(1, pn.guess([1, 1]))
    eq(1, pn.guess([1, 0]))
    eq(1, pn.guess([0, 0]))
    eq(1, pn.guess([0, 1]))
    eq(1, pn.guess([0, -1]))
    eq(-1, pn.guess([0, -2]))
    eq(-1, pn.guess([-1, -1]))
  },

  'train': () => {
    const f = x => x
    const test = () => {
      const pts = Array.from(Array(50), ()=>Point(f))
      const pn = Perceptron(2, 0.1)
  
      const preErrors = pts.reduce((acc, pt) => pn.guess(pt.coords)==pt.label ? acc : acc+1, 0)
      pts.forEach(pt => pn.train(pt.coords, pt.label))
      const postErrors = pts.reduce((acc, pt) => pn.guess(pt.coords)==pt.label ? acc : acc+1, 0)
      eq(true, preErrors>postErrors)
    }

    test()
    test()
    test()
  }
}