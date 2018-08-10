import { IBindings } from './FormatString'
import { default as Period, ITime } from './Period'

export interface IPeriodObject {
  name: string
  time: ITime
  timestamp: Date
}

export default class Schedule {
  public bindings: IBindings
  public display: string
  public length: number
  public name: string
  public periods: Period[]

  constructor (name: string,
               display: string,
               periods: Period[],
               bindings: IBindings = {}) {
    this.name = name
    this.display = display
    this.bindings = bindings

    this.periods = periods.sort((a, b) => (a.time.hour * 60 + a.time.min) - (b.time.hour * 60 + b.time.min))

    // Remove consecutive free periods
    for (let i = 0; i < this.periods.length; i++) {
      const displayName = this.periods[i].display(this.bindings)
      if (displayName === 'Free' || displayName === 'Passing to Free') {
        if (this.periods[i - 1] && (this.periods[i - 1].display(this.bindings) === 'Free' ||
                        this.periods[i - 1].display(this.bindings) === 'Passing to Free')) {
          this.periods[i - 1].formatString = 'Free'
          this.periods.splice(i, 1)
          i--
        }
      }
    }

    // If a period at the beginning is free, remove it
    if (this.periods[0] && this.periods[0].display(this.bindings) === 'Free') {
      this.periods.splice(0, 1)
    }

    // Calculate number of periods
    let count = 0
    let previous
    for (let i = 0; i < this.periods.length; i++) {
      const period = this.getPeriodByIndex(i, new Date())
      if (period !== previous) {
        count++
        previous = period
      }
    }
    this.length = count
  }

  public overrideDisplay (display: string | null): Schedule {
    if (!display) { return this }
    return new Schedule(this.name, display, this.periods, this.bindings)
  }

  public getCurrentPeriodIndex (date: Date): number {
    const time: ITime = {
      hour: date.getHours(),
      min: date.getMinutes()
    }

    for (let i = 0; i < this.periods.length; i++) {
      const period = this.periods[i]
      if (period.time.hour > time.hour) { return Number(i) - 1 }
      if (period.time.hour >= time.hour && period.time.min > time.min) { return Number(i) - 1 }
    }
    return this.periods.length - 1
  }

  public getFirstPeriod (date: Date): IPeriodObject | null {
    return this.getPeriodByIndex(0, date)
  }
  public getLastPeriod (date: Date): IPeriodObject | null {
    return this.getPeriodByIndex(this.length - 1, date)
  }

  public getCurrentPeriod (date: Date): IPeriodObject | null {
    return this.getPeriodByIndex(this.getCurrentPeriodIndex(date), date)
  }
  public getNextPeriod (date: Date): IPeriodObject | null {
    return this.getPeriodByIndex(this.getCurrentPeriodIndex(date) + 1, date)
  }
  public getPreviousPeriod (date: Date): IPeriodObject | null {
    return this.getPeriodByIndex(this.getCurrentPeriodIndex(date) - 1, date)
  }

  public getCompletedPeriods (date: Date): IPeriodObject[] {
    // If the index is (-1) or 0, return empty array
    return this.periods
      .slice(0, Math.max(this.getCurrentPeriodIndex(date), 0))
      .map((period) => this.periodToObject(period, date))
  }

  public getFuturePeriods (date: Date): IPeriodObject[] {
    return this.periods
      .slice(this.getCurrentPeriodIndex(date) + 1)
      .map((period) => this.periodToObject(period, date))
  }

  private getPeriodByIndex (i: number, date: Date): IPeriodObject | null {
    const period = this.periods[i]
    if (period) {
      return {
        name: period.display(this.bindings),
        time: period.time,
        timestamp: period.getTimestamp(date)
      }
    } else {
      return null
    }
  }

  private periodToObject (period: Period, date: Date): IPeriodObject {
    return {
      name: period.display(this.bindings),
      time: period.time,
      timestamp: period.getTimestamp(date)
    }
  }
}
