import React from 'react'
import { RouteHandler } from 'react-router'

export default class extends React.Component {
  render() {
    return (
      <div className="main">
        <RouteHandler model={this.props.model}/>
      </div>
    )
  }
}
