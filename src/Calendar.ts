import Schedule from './Schedule'

type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
interface IScheduleName {
  name: string
  display: string | null
}
export interface ISpecialSchedules {
  [date: string]: IScheduleName
}
export interface IWeeklySchedules {
  [day: string]: IScheduleName
}

export default class Calendar {

  public static padZeros (num: number | string, len: number): string {
    num = String(num)
    while (num.length < len) { num = '0' + num }
    return num
  }
  public static dateToString (date: Date): string {
    return `${Calendar.padZeros(date.getMonth() + 1, 2)}/${Calendar.padZeros(date.getDate(), 2)}/${date.getFullYear()}`
  }
  public static dayOfWeek (date: Date): Day {
    const day = date.getDay()
    return ({
      1: 'Mon',
      2: 'Tue',
      3: 'Wed',
      4: 'Thu',
      5: 'Fri',
      6: 'Sat',
      0: 'Sun'
    } as { [index: number]: Day })[day]
  }

  public week: IWeeklySchedules
  public special: ISpecialSchedules
  public schedules: { [name: string ]: Schedule }

  constructor (week: IWeeklySchedules, special: ISpecialSchedules, schedules: { [name: string]: Schedule }) {
    this.week = week
    this.special = special
    for (const day in special) {
      if (day.indexOf('-') > -1) {
        const range = day
        const schedule = special[day]
        const [start, end] = range.split('-')
        delete special[day]
        let current = new Date(start)
        while (Calendar.dateToString(current) !== end) {
          this.special[Calendar.dateToString(current)] = schedule
          current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1)
        }
        this.special[Calendar.dateToString(current)] = schedule
      }
    }
    this.schedules = schedules
  }

  public getSchedule (date: Date): Schedule {
    const {
      name,
      display
    } = this.special[Calendar.dateToString(date)] || this.week[Calendar.dayOfWeek(date)]
    let schedule = this.schedules[name]
    schedule = schedule.overrideDisplay(display)
    return schedule
  }
}
