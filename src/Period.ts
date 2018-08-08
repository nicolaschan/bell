import format from './FormatString'

interface Time {
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

  display (bindings: { [key: string]: string } = {}): string {
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

