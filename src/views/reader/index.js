import React from 'react'
import { Link } from 'react-router'

import Panel from './panel'
import Canvas from './canvas'
import app from 'app'

export default class extends React.Component {

  componentWillMount() {
    var canvas = app.getModel('canvas')
    canvas.setCurrentPage(+this.props.params.page)
  }

  render() {

    return (
      <div>
        <Panel />
        <Canvas />
      </div>
    )
  }
}
