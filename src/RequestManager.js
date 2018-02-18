class RequestManager {
  constructor (request) {
    this.request = request
    this.logged = {}
    this.cache = {}
  }

  async post (url, data) {
    return this.request.post(url, data)
  }

  async get (url, defaultValue) {
    this.logRequest(url, Date.now())
    var result
    try {
      result = await this.request.get(url)
      this.cache[url] = result
    } catch (e) {
      if (!defaultValue) {
        throw new Error(`Request failed: GET ${url}`)
      }
      result = defaultValue
    }
    return result
  }

  getCached (url) {
    return this.cache[url]
  }

  logRequest (url, time) {
    this.logged[url] = time
  }

  getAllLogs () {
    return this.logged
  }

  async getThrottled (url, defaultValue, timeout = 4 * 60 * 1000) {
    var requests = this.getAllLogs()
    var lastTime = requests[url]
    if (!lastTime || (Date.now() >= lastTime + timeout)) {
      return this.get(url, defaultValue)
    }
    return this.getCached(url, defaultValue)
  }

  getSync (url, defaultValue) {
    this.getThrottled(url, defaultValue)
    return this.getCached(url, defaultValue)
  }
}

module.exports = RequestManager
