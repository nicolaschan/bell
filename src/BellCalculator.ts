import Calendar from './Calendar'
import { default as Schedule, IPeriodObject } from './Schedule'

export default class BellCalculator {
  public calendar: Calendar

  constructor (calendar: Calendar) {
    this.calendar = calendar
  }

  public getTimeRemainingMs (date: Date): number {
    return this.getNextPeriod(date).timestamp.getTime() - date.getTime()
  }

  public getTimeRemainingString (date: Date): string {
    const time = Math.ceil(this.getTimeRemainingMs(date) / 1000) * 1000
    const hours = Math.floor(time / 1000 / 60 / 60)

    if (hours >= (10 * 365 * 24)) {
      return 'Infinity'
    }

    let seconds = Math.floor(time / 1000 % 60).toString()
    if (seconds.length < 2) { seconds = '0' + seconds }
    let minutes = Math.floor(time / 1000 / 60 % 60).toString()
    if (minutes.length < 2 && hours) { minutes = '0' + minutes }
    return (hours < 1) ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`
  }

  public searchForPeriod (startDate: Date, increment: number, skip: number = 0): IPeriodObject {
    if (increment === 0) { throw new Error('Increment cannot be 0 (search will never terminate)') }
    let period
    let date = startDate
    while (!period || skip > 0) {
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + increment, 0, 0, 0, 0)
      if (Math.abs(date.getTime() - Date.now()) > (10 * 365 * 24 * 60 * 60 * 1000)) {
        return {
          name: 'No periods',
          time: { hour: 0, min: 0 },
          timestamp: date
        }
      }
      const schedule = this.calendar.getSchedule(date)
      period = (increment < 0) ? schedule.getLastPeriod(date) : schedule.getFirstPeriod(date)
      if (period) { skip-- }
    }
    return period
  }

  public getNextPeriod (date: Date): IPeriodObject {
    return this.calendar.getSchedule(date).getNextPeriod(date) || this.searchForPeriod(date, 1)
  }

  public getPreviousPeriod (date: Date): IPeriodObject {
    return this.calendar.getSchedule(date).getPreviousPeriod(date) || this.searchForPeriod(date, -1, 1)
  }

  public getCurrentPeriod (date: Date): IPeriodObject {
    return this.calendar.getSchedule(date).getCurrentPeriod(date) || this.searchForPeriod(date, -1)
  }

  public getCurrentPeriodNumber (date: Date): number {
    return this.calendar.getSchedule(date).getCurrentPeriodIndex(date)
  }

  public getCompletedPeriods (date: Date): IPeriodObject[] {
    return this.calendar.getSchedule(date).getCompletedPeriods(date)
  }

  public getFuturePeriods (date: Date): IPeriodObject[] {
    return this.calendar.getSchedule(date).getFuturePeriods(date)
  }

  public getCurrentSchedule (date: Date): Schedule {
    return this.calendar.getSchedule(date)
  }

  public getProportionElapsed (date: Date): number {
    const currentPeriodStart = this.getCurrentPeriod(date).timestamp.getTime()
    const nextPeriodStart = this.getNextPeriod(date).timestamp.getTime()

    const totalTime = nextPeriodStart - currentPeriodStart
    const elapsedTime = this.getTimeElapsedMs(date)

    return elapsedTime / totalTime
  }

  public getTimeElapsedMs (date: Date): number {
    const currentPeriodStart = this.getCurrentPeriod(date).timestamp.getTime()
    return date.getTime() - currentPeriodStart
  }
}
