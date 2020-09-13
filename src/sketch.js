
const sketch = ( p ) => {
  const WIDTH = 500
  const HEIGHT = 500

  const LFA = 0
  const lfa = LinearFunctionApproximator(WIDTH, HEIGHT)
  const NN = 1

  const demos = [lfa]

  let canvas = null
  initCanvas = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT)
    canvas.parent("#cv")
  }

  let demoSelect = null
  const initDemoSelect = () => {
    demoSelect = p.createSelect()
    demoSelect.style('font-size', '13px')
    demoSelect.parent("#demoSelect")
    demoSelect.option("Single Layer Perceptron", LFA)
    demoSelect.option("Neural Network", NN)
    demoSelect.changed(demoSelectedEvent)
    demoSelect.value(LFA)
    demoSelectedEvent()
  }

  const demoSelectedEvent = () => {
    demos.forEach(d =>{ if(d.initialized) d.quit(p) })

    if (demoSelect.value() == LFA) lfa.init(p)
    else if (demoSelect.value() == NN) {}
  }

  p.setup = () => {
    initCanvas()
    initDemoSelect()
  }

  p.draw = () => {
    if (demoSelect.value() == LFA) lfa.draw(p)
    else if (demoSelect.value() == NN) {}
  }
}

let p5Instance = new p5(sketch);