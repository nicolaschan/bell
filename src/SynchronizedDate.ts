export default class SynchronizedDate {
  private ts: any // Date doesn't support .now()

  constructor (timesync: any) {
    this.ts = Date
    if (timesync) {
      this.ts = timesync.create({
        interval: 4 * 60 * 1000, // 4 minutes
        // Full URL is necessary for Chrome extension
        // If not building Chrome extension,
        // server can be changed to '/timesync'
        server: '/timesync'
      })
    }
  }

  public now (): number {
    return this.ts.now()
  }
}
