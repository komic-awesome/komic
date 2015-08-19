import React from 'react'
import { Link } from 'react-router'
import _ from 'mod/utils'

import Panel from './panel'
import Canvas from './canvas/index'
import Thumbview from './thumbview'
import ModalView from './modals/index'
import app from 'app'

export default class extends React.Component {

  constructor(props) {
    super(props)
    this.state = { thumbview: false }
  }

  componentWillReceiveProps(nextProps) {
    var params = nextProps.params
      , canvas = app.getModel('canvas')
    if (params && params.page) {
      canvas.setCurrentPage(params.page)
    }
  }

  componentWillMount() {
    var canvas = app.getModel('canvas')
    canvas.setCurrentPage(+this.props.params.page)
    app.on('toggle:thumbview', this.toggleThumbview, this)
  }

  componentWillUnmount() {
    app.off('toggle:thumbview', this.toggleThumbview, this)
  }

  toggleThumbview(showOrHide) {
    showOrHide = _.isUndefined(showOrHide)
      ? !this.state.thumbview
      : showOrHide
    this.setState({ thumbview: showOrHide })
  }

  render() {

    return (
      <div>
        <Panel ref="panel"/>
          <Canvas ref="canvas" />
          { this.state.thumbview && <Thumbview ref="thumbview" /> }
        <ModalView />
      </div>
    )
  }
}
