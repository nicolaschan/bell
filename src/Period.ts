import { Bindings, default as format } from './FormatString'

export interface Time {
  hour: number,
  min: number
}

export default class Period {
  time: Time
  formatString: string

  constructor (time: Time, formatString: string) {
    this.time = time
    this.formatString = formatString
  }

  display (bindings: Bindings = {}): string {
    return format(this.formatString, bindings)
  }

  getTimestamp (date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      this.time.hour,
      this.time.min,
      0, 0)
  }
}

