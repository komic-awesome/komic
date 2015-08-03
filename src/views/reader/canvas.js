import React from 'react'
import { Navigation } from 'react-router'

import app from 'app'
import routes from 'routes'

export default class extends React.Component {

  componentWillMount() {
    var canvas = app.getModel('canvas')
    canvas.on('turn:nextPage', this.transitionToPage)
  }

  componentWillUnmount() {
    var canvas = app.getModel('canvas')
    canvas.off('turn:nextPage', this.transitionToPage)
  }

  handleClick() {
    var canvas = app.getModel('canvas')
    canvas.trigger('turn:nextPage')
  }

  transitionToPage() {
    var router = app.get('router')
      , canvas = app.getModel('canvas')
    router.transitionTo('page', { page: canvas.get('currentPage') })
  }

  render() {

    var book = app.getModel('book')
      , currentPage = app.getModel('canvas').get('currentPage')

    return (
      <div className="canvas">
        <img { ...book.getCurrentImage(currentPage) }
          onClick={ this.handleClick } />
      </div>
    )
  }
}
