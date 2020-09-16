/**
 * Point Factory
 */
Point = lineFunction => {
  const pt = {}

  pt.f = lineFunction
  // [x, y] coordinates
  pt.coords = [math.random(-1, 1), math.random(-1, 1)]
  // Label based on the given lineFunction
  // if pt.y is higher than y calculated using pt.f(pt.x), then label as 1
  pt.label =  pt.coords[1] > pt.f(pt.coords[0]) ? 1 : -1

  return pt
}

/**
 * Draw functions for Point
 */
p5Point = {
  /**
   * Draw a single Point
   */
  draw: (p, pt, w, h, r, pn=null) => {
    // Y coordinates will be inverted so that the origin starts from bottom
    const drawCircle = ra => p.ellipse(pt.coords[0]*w, -pt.coords[1]*h, ra)

    // Draw base circle, where points labeled 1 will be white and -1 will be black
    if (pt.label==1) p.fill(255)
    else p.fill(0)
    p.stroke(0)
    p.strokeWeight(1)
    drawCircle(r)

    // If supplied a Perceptron, get guess and compare to target
    // If correct, draw smaller circle and fill with green, else red
    if(pn!=null) {
      let guess = pn.guess(pt.coords, pt.label)
      if (guess == pt.label) p.fill(0, 255, 0)
      else p.fill(255, 0, 0)

      p.noStroke(1)
      drawCircle(r-5)
    }
  },

  /**
   * Draw an array of Points
   */
  drawPoints: (p, pts, w, h, r, pn=null) => {
    pts.forEach(pt => p5Point.draw(p, pt, w, h, r, pn))
  }
}