import { Model } from 'backbone'
import CanvasModel from 'models/canvas'
import BookModel from 'models/book'

class AppModel extends Model {

  constructor(options) {
    super(options)
    this.modelAndCreateFuncMap = {
        book: 'createBookModel'
      , canvas: 'createCanvasModel'
    }
  }

  getModel(name) {
    if (!this.get(name)) {
      throw Error(`Model ${name} hasn't been defined`)
    }
    return this.get(name)
  }

  setModel(name, model) {
    if (this.get(name)) {
      throw Error(`Model ${name} has been defined`)
    }
    this.set(name, model)
    return this
  }

  createModel(name, ...other) {
    var func = this.modelAndCreateFuncMap[name]
    if (!func || !this[func]) { return }
    return this[func]()
  }

  createCanvasModel() {
    var bookModel = this.getModel('book')
      , canvasModel = new CanvasModel(bookModel.getCanvasModelInfo())
    this.setModel('canvas', canvasModel)
    return canvasModel
  }

  createBookModel() {
    this.setModel('book', new BookModel())
    return this.getModel('book')
  }
}

export default new AppModel
