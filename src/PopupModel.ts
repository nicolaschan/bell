import * as UAParser from 'ua-parser-js'

import Refresher from './Refresher'
import cookieManager from './LocalForageCookieManager'
import requestManager from './RequestManager2'

// Return true if obj1 contains all the keys of obj2 (deep)
const deepCompare = (obj1: any, obj2: any) => {
  if (typeof obj1 !== 'object') { return obj1 === obj2 }
  for (const key in obj2) {
    if (!deepCompare(obj1[key], obj2[key])) { return false }
  }
  return true
}

export default class PopupModel extends Refresher {

  get visible () {
    return this.enabled && this.text && this.text !== cookieManager.get('popup')
  }

  set visible (visible) {
    if (visible) {
      cookieManager.remove('popup').catch((e) => { /* not much we can do */ })
    } else {
      cookieManager.set('popup', this.text).catch((e) => { /* not much we can do */ })
    }
  }
  public text: string
  public href?: string
  private source: string
  private enabled: boolean

  constructor (source: string) {
    super(1 * 60 * 1000)
    this.source = source
    this.enabled = false
    this.text = ''
  }

  public async reloadData () {
    const messages = await requestManager.get(`/api/data/${this.source}/message`, [])
    const ua = new UAParser(navigator.userAgent)

    for (const message of messages) {
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
