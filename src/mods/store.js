const DB_NAME = 'komic'
const DB_TABLE_NAME = 'book' //app.getModel('book').getBookTitle()
const DB_VERSION = 1

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

    for (let i in options) {
      dbInfo[i] = options[i]
    }

    return new Promise((resolve, reject) => {
      let req = indexedDB.open(dbInfo.name, dbInfo.version)
      req.onerror = (evt) => {
        reject(evt.target.errorCode)
      }

      req.onupgradeneeded = (evt) => {
        let store = evt.currentTarget.result.createObjectStore(
            dbInfo.storeName, {keyPath: 'id', autoIncrement: true})
         store.createIndex('page', 'page', {unique: true})
      }

      req.onsuccess = (evt) => {
        dbInfo.db = evt.target.result
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

        req.onsuccess = (evt) => {
          if (evt.target.result) {
            resolve(evt.target.result.imageBlob)
          } else {
            reject('not found')
          }
        }
        req.onerror = (evt) => {
          reject(evt.target.errorCode)
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
          , index = self.getObjectStore(dbInfo.storeName, 'readonly').index('page')
          , req = index.openCursor()
          , iterationNumber = 1

        req.onsucess = () => {
          let cursor = req.result

          if (cursor) {
            let value = cursor.value
              , result = iterator(value, cursor.key, iterationNumber++)

            if ( result !== void(0)) {
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

  config(options) {
    if (typeof(options) === 'object') {
      if (this._ready !== null) {
        return false
      }

      for ( let i in options) {
        if(i === 'storeName') {
          options[i] = options[i].replace(/\W/g, '_')
        }

        this._config[i] = options[i]
      }
      return true
    } else if (typeof(options) === 'string') {
      return this._config[options]
    } else {
      return this._config
    }
  }
}
