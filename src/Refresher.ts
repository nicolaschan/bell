export default abstract class Refresher {
  private refreshing: boolean
  public initialized: boolean
  private currentTimeout: any
  private refreshInterval: number

  constructor (refreshInterval: number) {
    this.refreshInterval = refreshInterval
    this.refreshing = false
    this.initialized = false
  }

  protected abstract reloadData (): Promise<void>

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