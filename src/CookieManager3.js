const localForage = require('localforage')

class CookieManager {
  constructor (storage) {
    this.cache = {}
    try {
      this.storage = localForage.createInstance({
        name: 'countdown_1'
      })
    } catch (e) {
      console.log(e)
      console.warn('Failed to create localForage instance. Settings will not be saved after page closes.')
    }
  }

  async initialize () {
    if (this.storage) {
      var keys = await this.storage.keys()
      return Promise.all(keys.map(async key => {
        this.cache[key] = await this.storage.getItem(key)
      }))
    }
  }

  get (key, defaultValue) {
    if (!key) { return this.getAll() }
    return this.cache[key] || defaultValue
  }

  async set (key, value) {
    this.cache[key] = value
    if (this.storage) {
      try {
        await this.storage.setItem(key, value)
      } catch (e) {
        console.warn(e)
        console.warn('Could not save to database')
      }
    }
  }

  async remove (key) {
    delete this.cache[key]
    if (this.storage) {
      return this.storage.removeItem(key)
    }
  }

  async clear () {
    this.cache = {}
    if (this.storage) {
      return this.storage.clear()
    }
  }

  get keys () {
    if (this.storage) {
      return this.storage.keys()
    } else {
      return Object.keys(this.cache)
    }
  }

  getAll () {
    return this.cache
  }
}

module.exports = CookieManager
