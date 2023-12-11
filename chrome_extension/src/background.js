/* global chrome */

const CookieSerializer = require('../../src/CookieSerializer')
const cookieSerializer = new CookieSerializer()

chrome.runtime.onConnectExternal.addListener(port => {
  port.onMessage.addListener((message) => {
    if (message.type === 'all_cookies') {
      var cookies = cookieSerializer.serializeAll(message.value)
      chrome.storage.local.set(cookies)
    }
  })
})
