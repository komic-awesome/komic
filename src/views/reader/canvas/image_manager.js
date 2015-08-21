import $ from 'jquery'
import _ from 'mod/utils'
import browser from 'mod/browser'

const win = $(window)
    , TRANSFORM_PROP = browser.getVendorPropertyName('transform')
    , TRANSFORM_ORIGIN_PROP = browser.getVendorPropertyName('transformOrigin')
    , TRANSITION_PROP = browser.getVendorPropertyName('transition')
    , VIEW_EDGE_THRESHOLD = 5

export default class {
  constructor(options) {
    this.setViewInfo()
    this.x = this.y = 0
    this.scale = 1
  }

  setViewInfo() {
    this.viewWidth = win.width()
    this.viewHeight = win.height()
  }

  setImage(image) {
    this.image = $(image)

    var el = this.image

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
    return this
  }

  setBoundaryInfo() {
    var { viewWidth, viewHeight } = this
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

  move(deltaX, deltaY) {
    this.transform(this.x + deltaX, this.y + deltaY)
  }

  transform(x, y, scale = this.scale, duration = 0) {
    var node = this.getImage()[0]
      , style = node.style

    ;[this.x, this.y] = this.limitToboundary(x, y)

    style[TRANSFORM_PROP] =
      `translate3d(${this.x}px, ${this.y}px, 0) scale(${scale}, ${scale})`
    style[TRANSFORM_ORIGIN_PROP] = '0px 0px'
    style[TRANSITION_PROP] = duration ? `transform ${duration}ms ease-in-out` : 'none'

    return this
  }

  onMoveScroll(e) {
    e.preventDefault()
    this.transform(this.x - e.deltaX, this.y - e.deltaY)
  }

  @_.Debounce(300)
  onResize() {
    this.setViewInfo()
    this.setBoundaryInfo()
    this.transform(this.x, this.y)
  }

  onScaleScroll(e) {
    e.preventDefault()
    var [ prevWidth, prevHeight ] = [ this.width, this.height ]
    this.setScale(this.scale - e.deltaY * 0.01)
    var halfDeltaWidth = (prevWidth - this.width) / 2
      , halfDeltaHeight = (prevHeight - this.height) / 2
    this.x = this.x + halfDeltaWidth
    this.y = this.y + halfDeltaHeight
    this.transform(this.x, this.y, this.scale)
  }

  moveToCanvasTopCenter() {
    var { viewWidth } = this
      , { width } = this
      , moveToX = (viewWidth - width) / 2
      , moveToY = Math.max(...this.boundaryInfo.yRange)

    this.transform(moveToX, moveToY)

    return this
  }

  setMaxWidth(maxWidth) {
    this.setScale( maxWidth / this.naturalWidth )
    return this
  }

  isInTop() {
    var threshold = - VIEW_EDGE_THRESHOLD
    if (this.height > this.viewHeight && this.y < threshold) { return false }
    return true
  }

  moveOnMouseMove({prevClientX, prevClientY, currentClientX, currentClientY}) {
    var { width, height } = this
      , { viewWidth, viewHeight } = this
      , moveToX = 0
      , moveToY = 0

    if (viewWidth < width && prevClientX) {
      let delta = currentClientX - prevClientX

      moveToX = - (width - viewWidth - this.x) * delta / (
        (delta > 0) ? (viewWidth - prevClientX) : (prevClientX - 0)
        )
    }

    if (viewHeight < height && prevClientY) {
      let delta = currentClientY - prevClientY

      moveToY = - (height - viewHeight - this.y) * delta / (
        (delta > 0) ? (viewHeight - prevClientY) : (prevClientY - 0)
      )
    }

    this.move(moveToX, moveToY)
  }

  moveToTop({ duration }) {
    this.transform(this.x, 0, this.scale, duration)
  }

  isInBottom() {
    var threshold = this.viewHeight - this.height + VIEW_EDGE_THRESHOLD
    if (this.height > this.viewHeight && this.y > threshold) { return false }
    return true
  }

  moveToBottom({ duration }) {
    this.transform(this.x, this.viewHeight - this.height, this.scale, duration)
  }

  isPointInLeftImage({ pointX, pointY }) {
    return ((pointX > this.x && pointX < this.x + this.width / 2)
      && (pointY > this.y && pointY < this.y + this.height))
  }

  isPointInRightImage({ pointX, pointY }) {
    return ((pointX > this.x + this.width / 2 && pointX < this.x + this.width)
      && (pointY > this.y && pointY < this.y + this.height))
  }

  moveToCanvasCenter() {
    var { viewWidth, viewHeight } = this
      , { width, height } = this
      , moveToX = (viewWidth - width) / 2
      , moveToY = (viewHeight - height) / 2

    this.transform(moveToX, moveToY)

    return this
  }
}
