const UAParser = require('ua-parser-js')

// Return true if obj1 contains all the keys of obj2 (deep)
const deepCompare = function (obj1, obj2) {
  if (typeof obj1 !== 'object') { return obj1 === obj2 }

  for (let key in obj2) {
    if (!deepCompare(obj1[key], obj2[key])) { return false }
  }
  return true
}

class PopupModel {
  constructor (cookieManager, requestManager) {
    this.cookieManager = cookieManager
    this.requestManager = requestManager
  }

  get visible () {
    return this.enabled && this.text && this.text !== this.cookieManager.get('popup')
  }
  set visible (visible) {
    if (visible) {
      this.cookieManager.remove('popup')
    } else {
      this.cookieManager.set('popup', this.text)
    }
  }

  async refresh () {
    const dataSource = this.cookieManager.get('source', 'lahs')
    const messages = await this.requestManager.get(`/api/data/${dataSource}/message`, [])
    const ua = UAParser(navigator.userAgent)

    for (let message of messages) {
      const matches = !message.agent || deepCompare(ua, message.agent)
      if (matches) {
        this.enabled = message.message.enabled
        this.text = message.message.text.trim()
        this.href = message.message.href
        break
      }
    }
  }
}

module.exports = PopupModel
