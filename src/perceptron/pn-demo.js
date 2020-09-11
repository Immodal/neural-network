/**
 * Self-contained demo using Perceptrons for approximating a function
 * @param {Number} w Width of Canvas
 * @param {Number} h Height of Canvas
 */
PerceptronDemo = (w, h) => {
  const demo = {}
  demo.w = w
  demo.h = h

  /**
   * Set demo.f to be a function that returns the result of y = mx + c
   * @param {Number} m Slope of line
   * @param {Number} c Intercept of line
   */
  demo.setLineFunction = (m, c) => {
    demo.f = x => m * x + c
  }

  /**
   * Draw function to be called by sketch.js
   * @param {Object} p Object that is passed into the sketch function
   * @param {Number} r Radius of Circle when drawing Point
   * @param {Int} n Number of Points to generate for training
   */
  demo.draw = (p, r=15, n=1000) => {
    w = demo.w/2
    h = demo.h/2

    p.translate(w, h)
    p.background(200)

    p5Perceptron.draw(p, demo.perceptron, w, h, demo.f)
    p5Point.drawPoints(p, demo.points, w, h, r, demo.perceptron)

    if(demo.points.length < n) {
      let pt = Point(demo.f)
      demo.perceptron.train(pt.coords, pt.label)
      demo.points.push(pt)
    }
  }

  demo.perceptron = Perceptron(2, 0.005)
  demo.setLineFunction(1, 0)
  demo.points = []

  return demo
}