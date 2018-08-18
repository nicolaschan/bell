declare const timesync: any

let ts = Date
if (typeof timesync !== 'undefined') {
  ts = timesync.create({
    interval: 4 * 60 * 1000,
    // Full URL is necessary for Chrome extension
    // If not building Chrome extension,
    // server can be changed to '/timesync'
    server: '/timesync'
  })
}

export default class SynchronizedDate {
  private ts: any // Date doesn't support .now()

  constructor () {
    this.ts = ts
  }

  public now (): number {
    return this.ts.now()
  }
}
