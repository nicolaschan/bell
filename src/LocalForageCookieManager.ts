import * as localForage from 'localforage'
import * as memoryDriver from 'localforage-driver-memory'
import ICookieManager from './CookieManager'

class LocalForageCookieManager implements ICookieManager {

  get keys () {
    if (this.storage) {
      return this.storage.keys()
    } else {
      return Object.keys(this.cache)
    }
  }
  public initialized: boolean
  private storage: any
  private cache: { [name: string]: any }

  constructor () {
    this.cache = {}
    this.initialized = false
  }

  public async initialize () {
    if (this.initialized) {
      return
    }
    try {
      await localForage.defineDriver(memoryDriver)
      this.storage = localForage.createInstance({
        driver: [
          localForage.INDEXEDDB, localForage.WEBSQL, localForage.LOCALSTORAGE, memoryDriver._driver
        ],
        name: 'countdown_1'
      })
      this.storage.ready()
      .then(() => {
        console.log('Using localForage driver: ' + this.storage.driver())
      })
      .catch((e: any) => {
        console.warn('localForage.ready(): Failed to create localForage instance', e)
      })
    } catch (e) {
      console.warn('Failed to initialize storage', e)
    }
    if (this.storage) {
      const keys = await this.storage.keys()
      await Promise.all(keys.map(async (key: string) => {
        this.cache[key] = await this.storage.getItem(key)
      }))
    }
    this.initialized = true
  }

  public get (key: string, defaultValue?: any) {
    if (!key) { return this.getAll() }
    if (this.cache[key] === undefined) {
      return defaultValue
    }
    return this.cache[key]
  }

  public async set (key: string, value: any) {
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

  public async remove (key: string) {
    delete this.cache[key]
    if (this.storage) {
      return this.storage.removeItem(key)
    }
  }

  public async clear () {
    this.cache = {}
    if (this.storage) {
      return this.storage.clear()
    }
  }

  public getAll () {
    return this.cache
  }
}

export default new LocalForageCookieManager()
