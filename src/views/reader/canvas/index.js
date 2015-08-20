import React from 'react'
import { Navigation } from 'react-router'
import $ from 'jquery'
import Backbone from 'backbone'

import app from 'app'
import routes from 'routes'

import VerticalAlignMiddle from 'widgets/vertical_align_middle'
import ImageManager from './image_manager'
import CanvasImage from './image'
import loader from 'manager/loader'

export default class extends React.Component {

  constructor(options) {
    super(options)
    this.imageManger = new ImageManager()
    this.state = { loading: true }
  }

  componentWillReceiveProps() {
    this.state = {
      loading: !(loader.hasLoaded())
    }
  }

  componentWillMount() {
    var canvas = app.getModel('canvas')
    canvas.on('turn:nextPage turn:prevPage', ::this.transitionToPage)
  }

  componentWillUnmount() {
    var canvas = app.getModel('canvas')
    canvas.off('turn:nextPage turn:prevPage', ::this.transitionToPage)
  }

  transitionToPage() {
    var router = app.get('router')
      , canvas = app.getModel('canvas')
    router.transitionTo('page', { page: canvas.get('currentPage') })
  }

  scrollHandler(e) {
    this.imageManger[e.altKey ? 'onScaleScroll' : 'onMoveScroll'](e)
  }

  render() {

    var { loading } = this.state

    if (!loading) {
      return this.renderWithImage()
    } else {
      loader.loadCurrentImage()
        .then((imageBlob) => {
          loader.storeCurrentImage(imageBlob)
          this.setState({ loading: false})
        })
      return this.renderWithLoading()
    }

    return view
  }

  mousePositionDragImage(e) {
    if (!this.prevClientX) {
      this.prevClientX = e.clientX
      this.prevClientY = e.clientY
      return
    }

    this.imageManger.moveOnMouseMove({
      prevClientX: this.prevClientX
    , prevClientY: this.prevClientY
    , currentClientX: e.clientX
    , currentClientY: e.clientY
    })

    this.prevClientX = e.clientX
    this.prevClientY = e.clientY
  }

  mouseMoveHandle(e) {
    var canvas = app.getModel('canvas')
    if (!canvas.get('mousePositionDragImage')) { return }
    this.mousePositionDragImage(e)
  }

  renderWithImage() {
    return (
      <div className="canvas"
        onWheel={ ::this.scrollHandler }
        onMouseMove= { ::this.mouseMoveHandle }
        >
        <CanvasImage manager={ this.imageManger } />
      </div>
    )
  }

  renderWithLoading() {
    return (
      <div className="canvas">
        <VerticalAlignMiddle style={
          { width: '100%', height: '100%', textAlign: 'center' }
          }>
          载入中
        </VerticalAlignMiddle>
      </div>
    )
  }

}
