import * as UAParser from 'ua-parser-js'

import cookieManager from './LocalForageCookieManager'
import Refresher from './Refresher'
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

  /**
   * Returns a list of all messages that should be visible to the user, including both text
   * and an optional href.
   */
  get messages () {
    const content = cookieManager.get('popup', [])
    const keys = Object.keys(this.msgs)
    if (typeof content === 'string') {
      // convert from legacy, where only one message was seen at a given time
      cookieManager.set('popup', [content]).catch((e) => { /* not much we can do */ })
      return keys.filter((text) => text !== content)
        .map((text) => ({ text, href: this.msgs[text] }))
    }
    if (Array.isArray(content)) {
      // don't show messages that have already been hidden
      return keys.filter((text) => content.indexOf(text) < 0)
        .map((text) => ({ text, href: this.msgs[text] }))
    }
    return {}
  }
  private msgs: { [text: string]: string }
  private source: string

  constructor (source: string) {
    super(1 * 60 * 1000)
    this.source = source
    this.msgs = {}
  }

  /**
   * Specifies that the given popup message should be invisible.
   * Note that the cookie only stores text, not the href.
   */
  public markAsRead (text: string, read: boolean) {
    const readMsgs = cookieManager.get('popup', [])
    if (read) {
      if (typeof readMsgs === 'string') {
        if (readMsgs === text) {
          cookieManager.remove('popup').catch((e) => { /* not much we can do */ })
        }
      } else {
        const ind = readMsgs.indexOf(text)
        if (ind > 0) {
          readMsgs.splice(ind, 1)
        }
        cookieManager.set('popup', readMsgs).catch((e) => { /* not much we can do */ })
      }
    } else {
      if (typeof readMsgs === 'string') {
        const arr = text === readMsgs ? [readMsgs] : [readMsgs, text]
        cookieManager.set('popup', arr).catch((e) => { /* not much we can do */ })
      } else {
        if (readMsgs.indexOf(text) < 0) {
          readMsgs.push(text)
          cookieManager.set('popup', readMsgs).catch((e) => { /* not much we can do */ })
        }
      }
    }
  }

  public async reloadData () {
    const messages = await requestManager.get(`/api/data/${this.source}/message`, [])
    // using 'new' returns the wrong result -- be careful
    // @ts-ignore:2348
    const ua = UAParser(navigator.userAgent)
    for (const message of messages) {
      const matches = !message.agent || (deepCompare(ua, message.agent) && message.message.enabled)
      if (matches) {
        this.msgs[message.message.text.trim()] = message.message.href
      }
    }
  }
}
