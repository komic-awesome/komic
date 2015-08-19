import co from 'co'

import app from 'app'

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

function request(opts) {
  let xhr = opts.xhr
    , url = opts.url

  return new Promise((resolve, reject) => {
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response)
      } else {
        reject(xhr.status)
      }
    })
    xhr.addEventListener('error', reject)
    xhr.addEventListener('abort', reject)

    xhr.send()
  })
}

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
    this.MAX_COUNT = 5
    this.xhr = new XMLHttpRequest()
  }

  preloadImages() {
    spawn(function*() {
      let model = this.model
        , page = model.getCurrentPage() + 1
        , total = model.getTotalPage()
        , src
        , imageBlob

      while (true) {
        if (page > total || this.map.size >= this.MAX_COUNT) break
        if (this.map.has(page)) {
          page += 1
          continue
        }

        src = model.getImageUri(page)
        try {
          imageBlob = yield request({xhr: this.xhr, url: src})
          this.map.set(page, imageBlob)
        } catch(e) {
          page -= 1
        }

        page += 1
      }
    }.bind(this))
  }

  loadCurrentImage() {
    let map = this.map
      , model = this.model
      , page = model.getCurrentPage()
      , src = model.getImageUri(page)

    if (this.hasLoaded(page)) {
      return Promise.resolve()
    } else {
      return (request({ xhr: this.xhr, url: src })
        .then((imageBlob) => {
          this.storeCurrentImage(imageBlob)
        }))
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
