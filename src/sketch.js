
const sketch = ( p ) => {
  let WIDTH = 500
  let HEIGHT = 500

  let perceptronDemo = PerceptronDemo(WIDTH, HEIGHT)

  let canvas = null
  initCanvas = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT)
    canvas.parent("#cv")
  }

  p.setup = () => {
    initCanvas()
  }

  p.draw = () => {
    perceptronDemo.draw(p)
  }
}

let p5Instance = new p5(sketch);