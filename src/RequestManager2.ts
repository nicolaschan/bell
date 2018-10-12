import * as m from 'mithril'

interface IRequest {
  get: (url: string) => Promise<any>,
  post: (url: string, data: any) => Promise<any>
}

export class RequestManager {

  private request: IRequest
  private logged: { [url: string]: number }
  private cache: { [url: string]: any }

  constructor (request: IRequest) {
    this.request = request
    this.logged = {}
    this.cache = {}
  }

  public async post (url: string, data: any) {
    return this.request.post(url, data)
  }

  public async get (url: string, defaultValue?: any) {
    this.logRequest(url, Date.now())
    let result
    try {
      result = await this.request.get(url)
      this.cache[url] = result
    } catch (e) {
      result = defaultValue
    }
    if (result && result.error) {
      result = defaultValue
    }
    if (result === undefined) {
      throw new Error(`Request failed: GET ${url}`)
    }
    return result
  }

  public getCached (url: string, defaultValue?: any) {
    return this.cache[url] || defaultValue
  }

  public logRequest (url: string, time: number) {
    this.logged[url] = time
  }

  public getAllLogs () {
    return this.logged
  }

  public async getThrottled (url: string, defaultValue?: any, timeout = 4 * 60 * 1000) {
    const requests = this.getAllLogs()
    const lastTime = requests[url]
    if (!lastTime || (Date.now() >= lastTime + timeout)) {
      return this.get(url, defaultValue)
    }
    return this.getCached(url, defaultValue)
  }

  public getSync (url: string, defaultValue?: any) {
    this.getThrottled(url, defaultValue).catch((e) => {
      // failure is okay because we returned cached
    })
    return this.getCached(url, defaultValue)
  }
}

export default new RequestManager({
  get: async (url: string) => {
    return m.request({
      method: 'GET', url
    })
  },
  post: async (url: string, data: any) => {
    return m.request({
      method: 'POST', url, data
    })
  }
})
