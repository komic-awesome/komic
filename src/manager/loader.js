import co from 'co'

import app from 'app'
import Store from './store'
import request from 'mods/request'
import _ from 'mods/utils'

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

, getCurrentImageUri() {
    let page = this.getCurrentPage()
    return this.getImageUri(page)
  }

, getBookTitle: () => {
    return app.getModel('book').getTitle()
  }

, getUUID: () => {
    return app.getModel('book').getUUID()
  }
})

function spawn(fn) {
  return co.wrap(fn)()
}

/**
 * TODO(kyon)
 * use url instead page as key
 */
class Loader {
  constructor (options) {
    this.model = new Model()
    this.THRESHOLD = 5
    this.xhr = undefined
    this.cachedPages = new Map()
    app.on('fetched:book', () => {
      let uuid = this.model.getUUID()
        , version
        , versionTable = new Map(this.getFromLocalStorage())

      if (!versionTable) {
        version = 1
        versionTable = new Map()
        versionTable.set(uuid, version)
        this.saveToLocalStorage(versionTable)
      } else if (versionTable.has(uuid)) {
        version = versionTable.get(uuid)
      } else {
        version = versionTable.size + 1
        versionTable.set(uuid, version)
        this.saveToLocalStorage(versionTable)
      }

      let config = {
        'name': 'komic'
      , 'version': version
      , 'storeName': this.model.getBookTitle()+uuid
      }
      this.store = new Store(config)
      this.initPresentPages()
    }, this)
  }

  initPresentPages() {
    let self = this
    return this.store.iterate((val, key, iterationNumber) => {
      self.cachedPages.set(key, val)
    })
  }

  saveToLocalStorage(versionTable) {
    localStorage.setItem('manager/loader'
      , JSON.stringify(versionTable.toJSON()))
  }

  getFromLocalStorage() {
    return JSON.parse(localStorage.getItem('manager/loader'))
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
        if (page > total || page < 1) break
        if (page >= currentPage + this.THRESHOLD)  break

        if (this.cachedPages.has(model.getImageUri(page))) {
          page += 1
          continue
        }

        src = model.getImageUri(page)
        try {
          imageBlob = yield this.fetch({url: src})
          this.storeImage(src, imageBlob)
        } catch(e) {
          page -= 1
          break
        }

        page += 1
      }
    }.bind(this))
  }

  fetch(options, ...args) {
    this.xhr = new XMLHttpRequest()
    return request(Object.assign({ xhr: this.xhr }, options), ...args)
  }

  loadCurrentImage({ requestEvents }) {
    this.stopLoading()
    let model = this.model
      , page = model.getCurrentPage()
      , src = model.getImageUri(page)
      , noop = function() {}
      , self = this

    if (this.hasLoaded(src)) {
      return Promise.resolve()
    } else {
      return new Promise((resolve, reject) => {
        self.store.getItem(src).then((imageBlob) => {
          self.cachedPages.set(src, imageBlob)
          resolve()
        }, () => {
          self.fetch({ url: src, events: requestEvents })
            .then((imageBlob) => {
               self.storeCurrentImage(imageBlob).then(() => {
                 resolve()
               }, noop)
            })
        })
      })
    }
  }

  storeImage(key, val) {
    let imageData = {'url': key, 'imageBlob':val}
      , self = this

    return self.store.setItem(imageData).then(() => {
      self.cachedPages.set(key, val)
    }, () => {
      self.cachedPages.set(key, val)
    })
  }

  storeCurrentImage(val) {
    let key = this.model.getCurrentImageUri()

    if(this.cachedPages.has(key)) { return Promise.resolve() }

    return this.storeImage(key, val)
  }

  stopLoading() {
    if (!this.xhr) { return }
    if (this.xhr.readyState === request.States.DONE) { return }
    this.xhr.abort()
  }

  pickCachedImage(page) {
    let img = this.model.getImage(page)
      , cached = this.cachedPages.get(img.src)

    img.src = window.URL.createObjectURL(cached)

    return img
  }

  hasLoaded(key) {
    let url = key||this.model.getCurrentImageUri()
    return !!(this.cachedPages.has(url))
  }
}

export default new Loader
