DemoBase = () => {
  const db = {}

  db.makeDiv = (p, parent, title) => {
    const div = p.createDiv()
    div.parent(parent)
    div.class("section")
    const titleObj = p.createElement('h3', title)
    titleObj.parent(div)
    titleObj.class("title")
    return div
  }

  db.makeSliderGroup = (p, parent, title, sliderMin, sliderMax, sliderStart, sliderStep, sliderCallback=()=>{}) => {
    const titleObj = p.createP(title)
    titleObj.parent(parent)
    const slider = p.createSlider(sliderMin, sliderMax, sliderStart, sliderStep)
    slider.parent(parent)
    const label = p.createSpan(`${slider.value()}`)
    label.parent(titleObj)
    slider.changed(() => {
      label.html(slider.value())
      sliderCallback()
    })
    return slider
  }

  db.makeInputGroup = (p, parent, title, value, callback=()=>true) => {
    const titleObj = p.createP(title)
    titleObj.parent(parent)

    const input = p.createInput(value)
    input.parent(titleObj)
    input.size(50)

    const button = p.createButton("Set")
    button.parent(titleObj)
    button.mousePressed(() => callback(input))
    return input
  }

  db.makeDataLabel = (p, parent, title, value) => {
    const titleObj = p.createP(title)
    titleObj.parent(parent)
    const label = p.createSpan(value)
    label.parent(titleObj)

    return label
  }

  db.makeFileInputGroup = (p, parent, title, callback) => {
    const titleObj = p.createP(title)
    titleObj.parent(parent)

    const fileInput = p.createFileInput(callback);
    fileInput.parent(titleObj);
  }

  return db
}