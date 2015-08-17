import React from 'react'
import app from 'app'
import $ from 'jquery'

export default class extends React.Component {

  formChanged(e) {
    var form = $(e.currentTarget)
      , turnpageMethod = form.find('select[name=turnpage-method]').val()
      , canvas = app.getModel('canvas')

    canvas.set('turnpageMethod', turnpageMethod)
  }

  renderTurnpageMethodSelect() {
    var options = [
          ['CLICK_IAMGE_REGION', '单击图片左右区域进行翻页']
        , ['CLICK', '鼠标单击左右键进行翻页']
        , ['CLICK_TO_SCROLL', '鼠标单击左右键卷动翻页']
        ]
      , canvas = app.getModel('canvas')

    return (
      <div className="form-group">
        <label className="control-label" htmlFor="turnpage-method">
          鼠标翻页方式
        </label>
        <select id="turnpage-method" className="form-control"
          defaultValue={ canvas.get('turnpageMethod') }
          name="turnpage-method">
          {
            options.map(([value, label], index) => {
              return (
                <option value={ value } key={ index }>
                  { label }
                </option>
              )
            })
          }
        </select>
        <p className="help-block">
          * 如果鼠标右键用于翻页, 请使用 `Alt + 鼠标右键` 呼唤右键菜单。
        </p>
      </div>
    )
  }

  render() {
    return (
      <div className="config-form-modal">
        <h3>操作设置</h3>
        <form onChange={ ::this.formChanged }
          className="form-horizontal">
          { this.renderTurnpageMethodSelect() }
        </form>
      </div>
    )
  }
}
