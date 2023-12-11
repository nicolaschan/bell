/* global chrome */

const CookieSerializer = require('../../src/CookieSerializer')
const cookieSerializer = new CookieSerializer()

class CookieManager {
  constructor (cookies) {
    this.cookies = cookies
    chrome.storage.local.clear(() => {
      chrome.storage.local.set(cookies)
    })
  }

  get (key, defaultValue) {
    var raw = this.cookies[key]
    if (!raw) { return defaultValue }
    return cookieSerializer.deserialize(raw)
  }

  set (key, value) {
    this.cookies[key] = cookieSerializer.serialize(value)
    if (key === 'requestCache') {
      chrome.storage.local.set({
        requestCache: cookieSerializer.serialize(value)
      })
    }
  }

  remove (key) {
    return delete this.cookies[key]
  }

  clear () {
    this.cookies = {}
  }
}

var CookieManagerFactory = async function () {
  // Offline => get cookies from local storage
  var items = await new Promise((resolve, reject) =>
    chrome.storage.local.get(resolve))
  return new CookieManager(items)
}

module.exports = CookieManagerFactory
