import _ from 'mods/utils'

export default class Store {
  constructor(options) {
    this._dbInfo = null
    this._ready = null
    this._config = options
  }

  _initStorage(options) {
    let self = this
      , dbInfo = {
        db: null
      }

    Object.assign(dbInfo, options)

    return new Promise((resolve, reject) => {
      let req = indexedDB.open(dbInfo.name, dbInfo.version)
      req.onerror = (e) => {
        reject(e.target.errorCode)
      }

      req.onupgradeneeded = (e) => {
        let store = e.currentTarget.result.createObjectStore(
            dbInfo.storeName, {keyPath: 'id', autoIncrement: true})
         store.createIndex('url', 'url', {unique: true})
      }

      req.onsuccess = (e) => {
        dbInfo.db = e.target.result
        self._dbInfo = dbInfo
        resolve()
      }
    })
  }

  ready() {
    let self = this

    let ready = new Promise((resolve, reject) => {
      if (self._ready === null) {
        self._ready = self._initStorage(self._config)
      }

      self._ready.then(resolve, reject)
    })

    return ready
  }

  getObjectStore(store_name, mode) {
    let tx = this._dbInfo.db.transaction(store_name, mode)
    return tx.objectStore(store_name)
  }

  clear(store_name) {
    let self = this
    return new Promise((resolve, reject) => {
      self.ready.then(() => {
        let dbInfo = self._dbInfo
          , store = self.getObjectStore(dbInfo.storeName, 'readwrite')
          , req = store.clear()

        req.onsuccess = () => {
          resolve()
        }

        req.onerror = () => {
          reject(req.error)
        }
      })
    })
  }

  getItem(key) {
    let self = this

    return new Promise((resolve, reject) => {
      self.ready().then(() => {
        let dbInfo = self._dbInfo
          , store = self.getObjectStore(dbInfo.storeName, 'readonly')
          , req = store.get(key)

        req.onsuccess = (e) => {
          if (e.target.result) {
            resolve(e.target.result.imageBlob)
          } else {
            reject('not found')
          }
        }
        req.onerror = (e) => {
          reject(req.error)
        }
      })
    })
  }

  setItem(obj) {
    let self = this

    return new Promise((resolve, reject) => {
      self.ready().then(() => {
        let dbInfo = self._dbInfo
          , transaction = dbInfo.db.transaction(dbInfo.storeName, 'readwrite')
          , store = transaction.objectStore(dbInfo.storeName)
          , req

        try {
          req = store.add(obj)
        } catch (e) {
          reject(e)
        }

        transaction.oncomplete = () => {
          resolve()
        }

        transaction.onabort = transaction.onerror = () => {
          reject(req)
        }
      })
    })
  }

  iterate(iterator) {
    let self = this

    return new Promise((resolve, reject) => {
      self.ready().then(()=> {
        let dbInfo = self._dbInfo
          , index = self.getObjectStore(dbInfo.storeName, 'readonly').index('url')
          , req = index.openCursor()
          , iterationNumber = 1

        req.onsuccess = () => {
          let cursor = req.result

          if (cursor) {
            let value = cursor.value.imageBlob
              , result = iterator(value, cursor.key, iterationNumber++)

            if (!_.isUndefined(result)) {
              resolve(result)
            } else {
              cursor.continue()
            }
          } else {
            resolve()
          }
        }

        req.onerror = () => {
          reject(req.error)
        }

      })
    })
  }
}
