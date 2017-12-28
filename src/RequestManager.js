const $ = require('jquery')

const cache = 'requestCache'

class RequestManager {
  constructor (cookieManager, host, request, online, timeout = 4000) {
    if (host) {
      var lastChar = host.substring(host.length - 1)
      this.host = (lastChar === '/') ? host.substring(0, host.length - 1) : host
    } else {
      this.host = ''
    }
    this.cookieManager = cookieManager

    $.ajaxSetup({
      timeout: timeout
    })
    this.request = request || {
      post: (url, data) => {
        if ((online || navigator).onLine) { // Saves time waiting if offline
          return $.post(url, data)
        }
        throw new Error('Request failed because not online')
      },
      get: url => {
        if ((online || navigator).onLine) { // Saves time waiting if offline
          return $.get(url)
        }
        throw new Error('Request failed because not online')
      }
    }
  }

  async post (url, data) {
    var result
    try {
      result = await this.request.post(this.generateUrl(url), data)
    } catch (e) {
      throw new Error('Post failed')
    }
    return result
  }

  async get (url, defaultValue) {
    this.logRequest(url, Date.now())
    var result
    try {
      result = await this.getNoCache(url)
      this.cache(url, result)
    } catch (e) {
      result = this.getCached(url)
    }
    return result || defaultValue
  }

  generateUrl (url) {
    return `${this.host}${url}?_v=${Date.now()}`
  }

  async getNoCache (url) {
    var result
    try {
      result = await this.request.get(this.generateUrl(url))
    } catch (e) {
      throw new Error('Request failed')
    }
    return result
  }

  logRequest (url, time) {
    var logged = this.cookieManager.get('requestTimes', {})
    logged[url] = time
    return this.cookieManager.set('requestTimes', logged)
  }

  getAllLogs () {
    return this.cookieManager.get('requestTimes', {})
  }

  async getThrottled (url, defaultValue, timeout = 4 * 60 * 1000) {
    var requests = this.getAllLogs()
    var lastTime = requests[url]
    if (!lastTime || Date.now() > lastTime + timeout) { return this.get(url, defaultValue) }
    return this.getCached(url, defaultValue)
  }

  getSync (url, defaultValue) {
    this.getThrottled(url, defaultValue)
    return this.getCached(url, defaultValue)
  }

  getCached (url, defaultValue) {
    var cached = this.getAllCached()
    return cached[url] || defaultValue
  }

  getAllCached () {
    return this.cookieManager.get(cache, {})
  }

  setAllCached (all) {
    return this.cookieManager.set(cache, all)
  }

  cache (url, data) {
    var cached = this.getAllCached()
    cached[url] = data
    return this.setAllCached(cached)
  }

  clearCache () {
    return this.cookieManager.remove(cache)
  }
}

module.exports = RequestManager
