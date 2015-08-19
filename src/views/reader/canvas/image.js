import React from 'react'
import app from 'app'
import $ from 'jquery'
import Backbone from 'backbone'

import _ from 'mod/utils'
import loader from 'manager/loader'

const win = $(window)
    , MOUSE_RIGHT_BUTTON = 2
    , SCROLL_DURATION = 230

class Model extends Backbone.Model {
  @_.Memoize()
  getImageScale() {
    var book = app.getModel('book')
      , imageDiagonal = book.getNaturalAverageDiagonal()
      , canvasDiagonal = _.rectangleDiagonal(win.width(), win.height())

    if (canvasDiagonal > imageDiagonal) { return 1 }

    return (canvasDiagonal / imageDiagonal).toFixed(2)
  }
}

var MouseLeftClickHandlers = {
  CLICK_IAMGE_REGION(e) {
    var point = { pointX: e.pageX, pointY: e.pageY }
    if (this.imageManger.isPointInLeftImage(point)) {
      this.turnPrevPage()
    } else if (this.imageManger.isPointInRightImage(point)) {
      this.turnNextPage()
    }
  }
, CLICK() {
    this.turnNextPage()
  }
, CLICK_TO_SCROLL() {
    if (this.imageManger.isInBottom()) {
      this.turnNextPage()
    } else {
      this.imageManger.moveToBottom({ duration: SCROLL_DURATION })
    }
  }
}

var MouseRightClickHandlers = {
  CLICK_IAMGE_REGION() {}
, CLICK() {
    this.turnPrevPage()
  }
, CLICK_TO_SCROLL() {
    if (this.imageManger.isInTop()) {
      this.turnPrevPage()
    } else {
      this.imageManger.moveToTop({ duration: SCROLL_DURATION })
    }
  }
}

var ContextMenuHandlers = {
  CLICK_IAMGE_REGION() {}
, CLICK(e) { e.preventDefault() }
, CLICK_TO_SCROLL(e) { e.preventDefault() }
}

export default class extends React.Component {
  constructor(options) {
    super(options)
    this.guid = _.uniqueId()
    this.model = new Model()
    this.imageManger = this.props.manager
    this.state = { display: true }
  }

  componentWillMount() {
    win.on(`resize.${this.guid}`
      , ::this.imageManger.onResize)
  }

  componentWillUnmount() {
    win.off(`.${this.guid}`)
  }

  rendered() {
    this.imageManger
      .setImage(React.findDOMNode(this))
      .setScale(this.model.getImageScale())
      .moveToCanvasTopCenter()
  }

  componentDidMount() {
    this.rendered()
  }

  componentWillReceiveProps(...args){
    // Force <img/> to redraw
    //  See more: http://codepen.io/hxgdzyuyi/pen/LVooxp
    var node = React.findDOMNode(this)
    this.setState({ display: false })
    _.defer(this::() => {
      if (!document.contains(node)) { return }
      this.setState({ display: true })
    })
  }

  componentDidUpdate() {
    this.rendered()
  }

  handleClick(e) {
    if (this.dragIsTriggered) { return }
    var canvas = app.getModel('canvas')
    this::MouseLeftClickHandlers[canvas.get('turnpageMethod')](e)
  }

  turnPrevPage() {
    var canvas = app.getModel('canvas')
    canvas.trigger('turn:prevPage')
  }

  turnNextPage() {
    var canvas = app.getModel('canvas')
    canvas.trigger('turn:nextPage')
    loader.stopLoading()
  }

  handleMouseDown(e) {
    this.dragIsTriggered = !!this.mouseDown
    this.mouseDown = true
    this.prevPageX = this.originPageX = e.pageX
    this.prevPageY = this.originPageY = e.pageY
  }

  handleMouseUp(e) {
    var mouseDown = this.mouseDown
      , canvas = app.getModel('canvas')

    this.mouseDown = false

    if (e.button === MOUSE_RIGHT_BUTTON && mouseDown) {
      this::MouseRightClickHandlers[canvas.get('turnpageMethod')](e)
    }
  }

  handleMouseMove(e) {
    if (!this.mouseDown) { return }

    if (!this.dragIsTriggered) {
      var distance = Math.sqrt(Math.pow(this.originPageX - e.pageX, 2)
            + Math.pow(this.originPageY - e.pageY, 2))
        , CLICK_REGION_RADIUS = 15

      if (distance < CLICK_REGION_RADIUS) { return }
      this.dragIsTriggered = true
    }

    var deltaX = e.pageX - this.prevPageX
      , deltaY = e.pageY - this.prevPageY

    this.imageManger.move(deltaX, deltaY)
    this.prevPageX = e.pageX
    this.prevPageY = e.pageY
  }

  handleContextMenu(e) {
    if (e.altKey) { return }
    var canvas = app.getModel('canvas')
    this::ContextMenuHandlers[canvas.get('turnpageMethod')](e)
  }

  render() {
    var book = app.getModel('book')
      , currentPage = app.getModel('canvas').get('currentPage')
      , img = loader.pickCachedImage(currentPage)

    return (
      <img { ...img }
        style={{ display: this.state.display ? 'block' : 'none' }}
        ref="image"
        draggable="false"
        onClick={ ::this.handleClick }
        onMouseDown={ ::this.handleMouseDown }
        onMouseUp={ ::this.handleMouseUp }
        onMouseMove={ ::this.handleMouseMove}
        onLoad={ ::loader.preloadImages}
        onContextMenu={ this.handleContextMenu }
        />
    )
  }
}
