import $ from 'jquery'
import _ from 'mod/utils'

export default class {
  constructor(options) {
    var win = $(window)
    this.viewInfo = {
      viewWidth: win.width()
    , viewHeight: win.height()
    }
    this.x = this.y = 0
    this.scale = 1
  }

  setImage(image) {
    this.image = $(image)

    var viewInfo = this.viewInfo
      , el = this.image

    this.naturalWidth = el.width()
    this.naturalHeight = el.height()

    this.width = this.naturalWidth * this.scale
    this.height = this.naturalHeight * this.scale
    this.setBoundaryInfo()

    return this
  }

  setScale(scale) {
    this.scale = _.clamp(scale, [0.3, 2])
    this.width = this.naturalWidth * this.scale
    this.height = this.naturalHeight * this.scale
    this.setBoundaryInfo()
  }

  setBoundaryInfo() {
    var { viewWidth, viewHeight } = this.viewInfo
      , deltaWidth = viewWidth - this.width
      , halfDeltaWidth = deltaWidth / 2
      , deltaHeight = viewHeight - this.height
      , halfDeltaHeight = deltaHeight / 2

    this.boundaryInfo = {
      xRange: this.width > viewWidth
        ? [ deltaWidth, 0 ]
        : [ halfDeltaWidth, halfDeltaWidth ]
    , yRange: this.height > viewHeight
        ? [ deltaHeight, 0 ]
        : [ halfDeltaHeight, halfDeltaHeight ]
    }
  }

  getImage() {
    if (!this.image) {
      throw new Error(`Canvas' image node is undefined`)
    }
    return this.image
  }

  limitToboundary(x, y) {
    var { xRange, yRange } = this.boundaryInfo

    return [_.clamp(x, xRange), _.clamp(y, yRange)]
  }

  transform(x, y, scale = this.scale) {
    var el = this.getImage()
    ;[this.x, this.y] = this.limitToboundary(x, y)

    el[0].style.webkitTransform =
      `translate(${this.x}px, ${this.y}px) scale(${scale}, ${scale})`
    el[0].style.webkitTransformOrigin = '0px 0px'

    return this
  }

  onMoveScroll(e) {
    e.preventDefault()
    this.transform(this.x - e.deltaX, this.y - e.deltaY)
  }

  onScaleScroll(e) {
    e.preventDefault()
    var [ prevWidth, prevHeight ] = [ this.width, this.height ]
    this.setScale(this.scale + e.deltaY * 0.01)
    var halfDeltaWidth = (prevWidth - this.width) / 2
      , halfDeltaHeight = (prevHeight - this.height) / 2
    this.x = this.x + halfDeltaWidth
    this.y = this.y + halfDeltaHeight
    this.transform(this.x, this.y, this.scale)
  }

  moveToCanvasCenter() {
    var { viewWidth, viewHeight } = this.viewInfo
      , { width, height } = this
      , moveToX = (viewWidth - width) / 2
      , moveToY = (viewHeight - height) / 2

    this.transform(moveToX, moveToY)

    return this
  }
}
