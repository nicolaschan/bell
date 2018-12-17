import SynchronizedDate from './SynchronizedDate'

export default class CorrectedDate {
  public synchronizedDate: SynchronizedDate
  public correction: number // in milliseconds
  private devModeEnabled?: number
  private devModeStart?: number
  private devModeScale?: number

  constructor (synchronizedDate: SynchronizedDate, correction: number = 0) {
    this.synchronizedDate = synchronizedDate
    this.correction = correction
  }

  get date () {
    if (this.devModeEnabled && this.devModeStart && this.devModeScale !== undefined) {
      return new Date(
        this.devModeStart 
        + this.correction 
        + (this.synchronizedDate.now() - this.devModeEnabled) * this.devModeScale)
    }
    return new Date(this.synchronizedDate.now() + this.correction)
  }

  enableDevMode (startDate: any, scale: number = 0) {
    this.devModeEnabled = Date.now()
    this.devModeStart = startDate.getTime()
    this.devModeScale = scale
  }
}
