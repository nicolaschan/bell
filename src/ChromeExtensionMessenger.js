/* global chrome */

const SimpleLogger = require('./SimpleLogger').default
const cookieManager = require('./LocalForageCookieManager').default
const logger = new SimpleLogger()

class ChromeExtensionMessenger {
  connect (extensionId) {
    if (window.chrome && window.chrome.runtime) {
      logger.log('Attempting to connect to host...', 'ChromeExtensionMessenger')
      var port = chrome.runtime.connect(extensionId)
      port.postMessage({
        type: 'all_cookies',
        value: cookieManager.getAll()
      })
      // TODO add client success/failure messages
      logger.log('Chrome extension connection attempted', 'ChromeExtensionMessenger')
      port.onMessage.addListener(
        msg => port.postMessage(this.respond(msg)))
    }
  }

  respond (msg) {
    switch (msg.type) {
      case 'getAll':
        return {
          type: 'getAll',
          value: cookieManager.getAll()
        }
      case 'get':
        return {
          type: 'get',
          value: cookieManager.get(msg.key)
        }
      case 'set':
        return {
          type: 'set',
          value: cookieManager.set(msg.key, msg.value)
        }
      case 'remove':
        return {
          type: 'remove',
          value: cookieManager.remove(msg.key)
        }
      case 'clear':
        return {
          type: 'clear',
          value: cookieManager.clear()
        }
    }
  }
}

module.exports = ChromeExtensionMessenger
