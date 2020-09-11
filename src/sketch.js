
const sketch = ( p ) => {
  const WIDTH = 500
  const HEIGHT = 500

  const LFA = 0
  const lfa = LinearFunctionApproximator(WIDTH, HEIGHT)

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
    demoSelect.changed(demoSelectedEvent)
  }

  const demoSelectedEvent = () => {
    demos.forEach(d =>{ if(d.initialized) d.quit(p) })

    if (demoSelect.value() == LFA) lfa.init(p)
  }

  p.setup = () => {
    initDemoSelect()
    initCanvas()

    demoSelect.value(LFA)
    lfa.init(p)
  }

  p.draw = () => {
    if (demoSelect.value() == LFA) lfa.draw(p)
  }
}

let p5Instance = new p5(sketch);