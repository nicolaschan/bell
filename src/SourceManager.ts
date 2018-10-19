import cookieManager from './LocalForageCookieManager'

class SourceManager {
  private defaultSource: string

  constructor (defaultSource: string = 'lahs') {
    this.defaultSource = defaultSource
  }

  get source () {
    return cookieManager.get('source', this.defaultSource)
  }

  set source (source) {
    if (source) {
      cookieManager.set('source', source).catch((e) => {
        // not much we can do
      })
    }
  }

  public async clearSource () {
    await cookieManager.remove('source')
  }
}

export default new SourceManager()
