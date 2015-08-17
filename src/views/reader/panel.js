import React from 'react'
import { Link } from 'react-router'

import app from 'app'

export default class extends React.Component {
  toggleThumbview() {
    app.trigger('toggle:thumbview')
  }

  toggleConfigModal() {
    app.trigger('toggle:modal', { modalId: 'config' })
  }

  render() {
    var canvasModel = app.getModel('canvas')
      , currentPage = canvasModel.get('currentPage')

    return (
      <div className="aside">
        <ul className="panel">
          <li>
            <a href="#" title="页码" className="btn">{ currentPage }</a>
          </li>
          <li>
            <a title="目录" className="btn" href="#"
              onClick={ this.toggleThumbview }>总</a>
          </li>
          <li>
            <a title="设定" className="btn" href="#"
              onClick={ this.toggleConfigModal }>设</a>
          </li>
          <li>
            <Link to="home" href="#" title="返回" className="btn">返</Link>
          </li>
        </ul>
      </div>
    )
  }
}
