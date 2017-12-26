const localForage = require('localforage')

class CookieManager {
  constructor (storage) {
    this.cache = {}
    this.storage = localForage.createInstance({
      name: 'countdown_1'
    })
  }

  async initialize () {
    var keys = await this.storage.keys()
    for (let key of keys) {
      this.cache[key] = await this.storage.getItem(key)
    }
  }

  get (key, defaultValue) {
    if (!key) { return this.getAll() }
    return this.cache[key] || defaultValue
  }

  set (key, value) {
    this.cache[key] = value
    return this.storage.setItem(key, value)
  }

  remove (key) {
    delete this.cache[key]
    return this.storage.removeItem(key)
  }

  clear () {
    this.cache = {}
    return this.storage.clear()
  }

  get keys () {
    return this.storage.keys()
  }

  getAll () {
    return this.cache
  }
}

module.exports = CookieManager
