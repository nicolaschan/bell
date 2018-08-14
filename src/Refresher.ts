export default abstract class Refresher {
  public initialized: boolean
  private refreshing: boolean
  private currentTimeout: any
  private refreshInterval: number

  constructor (refreshInterval: number) {
    this.refreshInterval = refreshInterval
    this.refreshing = false
    this.initialized = false
  }

  public async initialize () {
    if (!this.initialized) {
      await this.reloadData()
      this.initialized = true
    }
    this.refreshing = true
    this.refresh(this.refreshInterval)
  }

  public stopRefreshing () {
    this.refreshing = false
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout)
    }
  }

  protected abstract reloadData (): Promise<void>

  private refresh (refreshInterval: number) {
    if (!this.refreshing) { return }
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout)
    }
    this.currentTimeout = setTimeout(async () => {
      try {
        await this.reloadData()
      } catch (e) {
        // it's okay, try again next time
      }
      this.refresh(refreshInterval)
    }, refreshInterval)
  }
}
