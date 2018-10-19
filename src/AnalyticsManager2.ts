import cookieManager from './LocalForageCookieManager'
import requestManager from './RequestManager2'

import Logger from './SimpleLogger'
import ThemeManager from './ThemeManager'
import * as version from './Version'

export default class AnalyticsManager {

  private logger: Logger
  private newPageLoad: boolean
  private initialized: boolean

  constructor (logger: Logger) {
    this.logger = logger
    this.initialized = false

    // Report analytics counts as a page hit
    this.newPageLoad = true
  }

  public async initialize () {
    if (this.initialized) { return }
    await cookieManager.initialize()

    let uuid = cookieManager.get('id')
    if (!uuid) {
      uuid = (await requestManager.get('/api/uuid')).id
      await cookieManager.set('id', uuid)
    }

    this.initialized = true
  }

  public async reportAnalytics () {
    await this.initialize()

    let send
    try {
      send = await requestManager.post('/api/stats/hit', {
        id: cookieManager.get('id'),
        newPageLoad: this.newPageLoad,
        source: cookieManager.get('source'),
        theme: new ThemeManager(cookieManager.get('theme')).currentTheme.name,
        userAgent: window.navigator.userAgent,
        version
      })
    } catch (e) {
      this.logger.warn('Analytics sending failed')
      return send
    }

    this.newPageLoad = false

    if (send.success) {
      this.logger.success('Analytics data sent successfully')
    } else {
      this.logger.warn('Analytics are disabled')
    }

    return send
  }
}
