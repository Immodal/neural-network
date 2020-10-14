let z = null
let zp = null

const sketch = ( p ) => {
  const LFA = 0
  const lfa = LinearFunctionApproximator(500, 500)
  const DREC = 1
  const drec = DigitRecognition(500, 500)
  const LA = 2
  const la = LogicApproximator(500, 500)

  const demos = [lfa, drec, la]
  z = demos
  zp = p

  let demoSelect = null
  const initDemoSelect = () => {
    demoSelect = p.createSelect()
    demoSelect.style('font-size', '13px')
    demoSelect.parent("#demoSelect")
    demoSelect.option("Linear Function Approximator", LFA)
    demoSelect.option("Digit Recognition", DREC)
    demoSelect.option("Logic Approximator", LA)
    demoSelect.changed(demoSelectedEvent)
    demoSelect.value(LA)
    demoSelectedEvent()
  }

  const demoSelectedEvent = () => {
    demos.forEach(d =>{ if(d.initialized) d.quit(p) })

    if (demoSelect.value() == LFA) lfa.init(p)
    else if (demoSelect.value() == DREC) drec.init(p)
    else if (demoSelect.value() == LA) la.init(p)
  }

  p.setup = () => {
    initDemoSelect()
  }

  p.draw = () => {
    if (demoSelect.value() == LFA) lfa.draw(p)
    else if (demoSelect.value() == DREC) drec.draw(p)
    else if (demoSelect.value() == LA) la.draw(p)
  }
}

let p5Instance = new p5(sketch);