import SynchronizedDate from './SynchronizedDate'

export default class CorrectedDate {
  public synchronizedDate: SynchronizedDate
  public correction: number // in milliseconds

  constructor (synchronizedDate: SynchronizedDate, correction: number = 0) {
    this.synchronizedDate = synchronizedDate
    this.correction = correction
  }

  get date () {
    return new Date(this.synchronizedDate.date.now() + this.correction)
  }
}
