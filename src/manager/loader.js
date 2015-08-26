import co from 'co'

import app from 'app'
import request from 'mods/request'

var Model = Backbone.Model.extend({
  getImage: (page) => {
    return app.getModel('book').getCurrentImage(page)
  }

, getCurrentPage: () => {
    return app.getModel('canvas').get('currentPage')
  }

, getTotalPage: () => {
    return app.getModel('canvas').get('totalPage')
  }

, getImageUri: (page) => {
    return app.getModel('book').getCurrentImageUri(page)
  }
})


function spawn(fn) {
  return co.wrap(fn)()
}

/**
 * TODO
 * 1. manage data in map, eg. override old data
 * 2. use indexDB or loacalStorage to save memory using
 */
class Loader {
  constructor (options) {
    this.map = new Map()
    this.model = new Model()
    this.THRESHOLD = 5
    this.xhr = undefined
  }

  preloadImages() {
    this.stopLoading()
    spawn(function*() {
      let model = this.model
        , currentPage = model.getCurrentPage()
        , page = currentPage + 1
        , total = model.getTotalPage()
        , src
        , imageBlob

      while (true) {
        if (this.map.has(page)) {
          page += 1
          continue
        }

        if (page > total || page < 1) break
        if (page >= currentPage + this.THRESHOLD)  break

        src = model.getImageUri(page)
        try {
          imageBlob = yield this.request({url: src})
          this.map.set(page, imageBlob)
        } catch(e) {
          page -= 1
        }

        page += 1
      }
    }.bind(this))
  }

  request(options, ...args) {
    this.xhr = new XMLHttpRequest()
    return request(Object.assign({ xhr: this.xhr }, options), ...args)
  }

  loadCurrentImage() {
    this.stopLoading()
    let map = this.map
      , model = this.model
      , page = model.getCurrentPage()
      , src = model.getImageUri(page)
      , noop = function() {}

    if (this.hasLoaded(page)) {
      return Promise.resolve()
    } else {
      return (this.request({ url: src })
        .then((imageBlob) => {
          this.storeCurrentImage(imageBlob)
        }, noop))
    }
  }

  store(key, val) {
    if (!this.map.has(key)) {
      this.map.set(key, val)
    }
  }

  storeCurrentImage(val) {
    let page = this.model.getCurrentPage()
    this.store(page, val)
  }

  stopLoading() {
    if (!this.xhr) { return }
    this.xhr.abort()
  }

  pickCachedImage(page) {
    let img = this.model.getImage(page)
      , cached = this.map.get(page)

    img.src = window.URL.createObjectURL(cached)
    return img
  }

  hasLoaded(key) {
    let page = key||this.model.getCurrentPage()
    return !!(this.map.has(page))
  }
}

export default new Loader
