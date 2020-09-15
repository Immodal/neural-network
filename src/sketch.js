let z = null
const sketch = ( p ) => {
  const LFA = 0
  const lfa = LinearFunctionApproximator(500, 500)
  const DREC = 1
  const drec = DigitRecognition(500, 500)
  z = drec

  const demos = [lfa, drec]

  let demoSelect = null
  const initDemoSelect = () => {
    demoSelect = p.createSelect()
    demoSelect.style('font-size', '13px')
    demoSelect.parent("#demoSelect")
    demoSelect.option("Linear Function Approximator", LFA)
    demoSelect.option("Digit Recognition", DREC)
    demoSelect.changed(demoSelectedEvent)
    demoSelect.value(LFA)
    demoSelectedEvent()
  }

  const demoSelectedEvent = () => {
    demos.forEach(d =>{ if(d.initialized) d.quit(p) })

    if (demoSelect.value() == LFA) lfa.init(p)
    else if (demoSelect.value() == DREC) drec.init(p)
  }

  p.setup = () => {
    initDemoSelect()
  }

  p.draw = () => {
    if (demoSelect.value() == LFA) lfa.draw(p)
    else if (demoSelect.value() == DREC) {}
  }
}

let p5Instance = new p5(sketch);