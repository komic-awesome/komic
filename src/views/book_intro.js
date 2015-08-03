import React from 'react'
import VertialAlignMiddle from '../widgets/vertical_align_middle'
import { Link } from 'react-router'

class BookCover extends React.Component {
  render() {
    var model = this.props.model

    return (
      <div className="hardcover" style={ model.getBookCoverSize() }>
        <ul className="hardcover-front">
          <li>
            <img { ...model.getBookCoverImg() }/>
          </li>
          <li></li>
        </ul>
        <ul className="page">
          <li></li>
          <li>
            <VertialAlignMiddle>
              <div style={ Object.assign(model.getBookCoverSize(), {textAlign: 'center'}) }>
                <Link to="reader" params={{page: "0"}} className="btn btn-read">阅 读</Link>
              </div>
            </VertialAlignMiddle>
          </li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
        <ul className="hardcover-back">
          <li></li>
          <li></li>
        </ul>
        <ul className="book-spine">
          <li></li>
          <li></li>
        </ul>
      </div>
    )
  }
}

class BookIntroDetail extends React.Component {
  render() {
    var model = this.props.model
    return (
      <div className="book-intro-detail">
        <h1>{ model.get('name') }</h1>
        <p className="author">
          { 'By ' + model.get('author').name }
        </p>
        <p className="description">
          { model.get('description') }
        </p>
      </div>
    )
  }
}

export default class extends React.Component {
  render() {
    return (
      <div className="book-intro">
        <BookCover model={this.props.model}/>
        <BookIntroDetail model={this.props.model}/>
      </div>
    )
  }
}
