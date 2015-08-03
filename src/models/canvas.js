import { Model } from 'backbone'

export default class extends Model {

  constructor(options) {
    super(options)
    if (options.totalPage && options.totalPage > 0) {
      this.set('currentPage', 1)
    }
    this.on('turn:nextPage', this.turnNextPage)
  }

  defaults() {
    return {
      totalPage: 0
    , currentPage: 0
    }
  }

  setCurrentPage(currentPage) {
    currentPage = +currentPage
    var totalPage = this.get('totalPage')
    if (currentPage > totalPage) {
      currentPage = totalPage
    }

    if (currentPage < 1) {
      currentPage = 1
    }

    this.set('currentPage', currentPage)
    return this
  }

  turnNextPage() {
    var currentPage = this.get('currentPage')
    this.setCurrentPage(currentPage + 1)
  }

}
