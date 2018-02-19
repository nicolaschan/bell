/* global chrome */

const $ = require('jquery')

const CookieSerializer = require('../../src/CookieSerializer')
const cookieSerializer = new CookieSerializer()

class CookieManager {
  constructor (cookies) {
    this.cookies = cookies
    chrome.storage.local.clear(() =>
      chrome.storage.local.set(cookies))
  }

  get (key, defaultValue) {
    var raw = this.cookies[key]
    if (!raw) { return defaultValue }
    return cookieSerializer.deserialize(raw)
  }

  set (key, value) {
    this.cookies[key] = cookieSerializer.serialize(value)
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
  var cookieManager = new CookieManager(items);

  (async () => {
    // Load data in the background (so it opens faster)
    var frame = $('<iframe src="https://countdown.zone"></iframe>')
    $('#iframe').append(frame)

    var port = await new Promise((resolve, reject) =>
      chrome.runtime.onConnectExternal.addListener(resolve))
    var cookies = await new Promise((resolve, reject) => {
      port.onMessage.addListener(msg => resolve(msg.value))
    })
    cookies = cookieSerializer.serializeAll(cookies)
    cookieManager.cookies = cookies
    chrome.storage.local.clear(() =>
      chrome.storage.local.set(cookies))
  })()

  return cookieManager
}

module.exports = CookieManagerFactory
