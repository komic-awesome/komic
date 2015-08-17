import React from 'react'
import app from 'app'
import ConfigView from './config'

var modalIdAndViewMap = {
  config: ConfigView
}

export default class extends React.Component {

  constructor(options) {
    super(options)
    this.state = {
      display: false
    , modalId: undefined
    }
  }

  componentWillMount() {
    app.on('toggle:modal', this.toggleModal, this)
  }

  componentWillUnmount() {
    app.off('toggle:modal', this.toggeModal, this)
  }

  toggleModal({ modalId }) {
    var showOrHide = !this.state.display
    this.setState({ display: showOrHide, modalId: modalId })
  }

  renderNoop() {
    return (<div style={{ display: 'none' }}></div>)
  }

  closeModal() {
    this.setState({ display: false })
  }

  renderModalContent() {
    var modalId = this.state.modalId
      , View = modalIdAndViewMap[modalId]
    if (!View) { throw new Error(`ModalId(${modalId}) dosen't exist.`) }
    return ( <View/> )
  }

  renderModal() {
    return (
      <div className="modal-overlay" onClick={ ::this.closeModal }>
        <div className="modal-stick"></div>
        <div className="modal-content" onClick={ (e) => { e.stopPropagation() } }>
          { this.renderModalContent() }
        </div>
      </div>
    )
  }

  render() {
    if (this.state.display) { return this.renderModal() }
    return this.renderNoop()
  }
}
