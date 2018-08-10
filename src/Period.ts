import { default as format, IBindings } from './FormatString'

export interface ITime {
  hour: number
  min: number
}

export default class Period {
  public time: ITime
  public formatString: string

  constructor (time: ITime, formatString: string) {
    this.time = time
    this.formatString = formatString
  }

  public display (bindings: IBindings = {}): string {
    return format(this.formatString, bindings)
  }

  public getTimestamp (date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      this.time.hour,
      this.time.min,
      0, 0)
  }
}
