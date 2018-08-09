import Schedule from './Schedule'

type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
type SpecialSchedules = { [date: string]: Schedule }
type WeeklySchedules = { [day: string]: Schedule }

export default class Calendar {

  week: WeeklySchedules
  special: SpecialSchedules
  schedules: { [name: string ]: Schedule }

  constructor (week: WeeklySchedules, special: SpecialSchedules, schedules: { [name: string]: Schedule }) {
    this.week = week
    this.special = special
    for (var day in special) {
      if (day.indexOf('-') > -1) {
        var range = day
        var schedule = special[day]
        var [start, end] = range.split('-')
        delete special[day]
        var current = new Date(start)
        while (Calendar.dateToString(current) !== end) {
          this.special[Calendar.dateToString(current)] = schedule
          current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1)
        }
        this.special[Calendar.dateToString(current)] = schedule
      }
    }
    this.schedules = schedules
  }

  getSchedule (date: Date): Schedule {
    var {
      name,
      display
    } = this.special[Calendar.dateToString(date)] || this.week[Calendar.dayOfWeek(date)]
    var schedule = this.schedules[name]
    schedule = schedule.overrideDisplay(display)
    return schedule
  }

  static padZeros (num: number | string, len: number): string {
    num = String(num)
    while (num.length < len) { num = '0' + num }
    return num
  }
  static dateToString (date: Date): string {
    return `${Calendar.padZeros(date.getMonth() + 1, 2)}/${Calendar.padZeros(date.getDate(), 2)}/${date.getFullYear()}`
  }
  static dayOfWeek (date: Date): Day {
    const day = date.getDay()
    return (<{ [index: number]: Day }> {
      1: 'Mon',
      2: 'Tue',
      3: 'Wed',
      4: 'Thu',
      5: 'Fri',
      6: 'Sat',
      0: 'Sun'
    })[day]
  }
}
