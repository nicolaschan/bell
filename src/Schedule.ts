import { Bindings } from './FormatString'
import { default as Period, Time } from './Period'

interface PeriodObject {
  time: Time,
  name: string,
  timestamp: Date
}

export default class Schedule {

  name: string
  display: string
  periods: Period[]
  bindings: Bindings
  length: number

  constructor (name: string, display: string, periods: Period[], bindings: Bindings = {}) {
    this.name = name
    this.display = display
    this.bindings = bindings

    this.periods = periods.sort((a, b) => (a.time.hour * 60 + a.time.min) - (b.time.hour * 60 + b.time.min))

    // Remove consecutive free periods
    var i = 0
    while (i < this.periods.length) {
      if (this.periods[i].display(this.bindings) === 'Free' || this.periods[i].display(this.bindings) === 'Passing to Free') {
        if (this.periods[i - 1] && (this.periods[i - 1].display(this.bindings) === 'Free' ||
                        this.periods[i - 1].display(this.bindings) === 'Passing to Free')) {
          this.periods[i - 1].formatString = 'Free'
          this.periods.splice(i, 1)
          i--
        }
      }
      i++
    }

    // If a period at the beginning is free, remove it
    if (this.periods[0] && this.periods[0].display(this.bindings) === 'Free') {
      this.periods.splice(0, 1)
    }

    // Calculate number of periods
    var count = 0
    var previous
    for (let i = 0; i < this.periods.length; i++) {
      var period = this.getPeriodByIndex(i, new Date())
      if (period !== previous) {
        count++
        previous = period
      }
    }
    this.length = count
  }

  overrideDisplay (display: string | null): Schedule {
    if (!display) { return this }
    return new Schedule(this.name, display, this.periods, this.bindings)
  }

  getCurrentPeriodIndex (date: Date): number {
    var time: Time = {
      hour: date.getHours(),
      min: date.getMinutes()
    }

    for (let i in this.periods) {
      let period = this.periods[i]
      if (period.time.hour > time.hour) { return Number(i) - 1 }
      if (period.time.hour >= time.hour && period.time.min > time.min) { return Number(i) - 1 }
    }
    return this.periods.length - 1
  }

  getPeriodByIndex (i: number, date: Date): PeriodObject {
    var period = this.periods[i]

    if (period) {
      return {
        time: period.time,
        name: period.display(this.bindings),
        timestamp: period.getTimestamp(date)
      }
    }
  }

  getFirstPeriod (date: Date): PeriodObject {
    return this.getPeriodByIndex(0, date)
  }
  getLastPeriod (date: Date): PeriodObject {
    return this.getPeriodByIndex(this.length - 1, date)
  }

  getCurrentPeriod (date: Date): PeriodObject {
    return this.getPeriodByIndex(this.getCurrentPeriodIndex(date), date)
  }
  getNextPeriod (date: Date): PeriodObject {
    return this.getPeriodByIndex(this.getCurrentPeriodIndex(date) + 1, date)
  }
  getPreviousPeriod (date: Date): PeriodObject {
    return this.getPeriodByIndex(this.getCurrentPeriodIndex(date) - 1, date)
  }
}
