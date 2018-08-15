import BellCalculator from './BellCalculator'
import Calendar from './Calendar'
import parseCalendar from './CalendarParser'
import CorrectedDate from './CorrectedDate'
import { getCustomCalendar, ICourses } from './CustomSchedule'
import { IBindings } from './FormatString'
import { default as defaultRequestManager, RequestManager } from './RequestManager2'
import { default as Schedule, IPeriodObject } from './Schedule'
import parseSchedules from './ScheduleParser'

export default class BellTimer {
  public source: string
  public correctedDate: CorrectedDate
  public requestManager: any
  public initialized: boolean
  public refreshing: boolean
  public currentTimeout: any
  public calculator!: BellCalculator
  public bindings: IBindings | null
  public courses: ICourses | null
  public meta?: object

  constructor (source: string,
               correctedDate: CorrectedDate,
               bindings: IBindings | null,
               courses: ICourses | null,
               requestManager: RequestManager = defaultRequestManager) {
    this.source = source
    this.correctedDate = correctedDate
    this.initialized = false
    this.refreshing = false
    this.currentTimeout = null
    this.bindings = bindings
    this.courses = courses
    this.requestManager = requestManager
  }

  get date () {
    return this.correctedDate.date
  }

  set calendar (calendar: Calendar) {
    this.calculator = new BellCalculator(calendar)
  }

  get calendar (): Calendar {
    return this.calculator.calendar
  }

  public loadCustomCourses () {
    this.correctedDate.correction = 0
    this.calendar = getCustomCalendar(this.courses!)
  }

  public loadData (sources: string[], correction: number, schedules: string, calendar: string) {
    if (sources.indexOf(this.source) < 0) {
      throw new Error(`Source not found: ${this.source}`)
    }
    this.correctedDate.correction = correction
    this.calendar = parseCalendar(calendar, parseSchedules(schedules, this.bindings!))
  }

  public async reloadData (): Promise<void> {
    if (this.source === 'custom') {
      return this.loadCustomCourses()
    }
    const [sources, data] = await Promise.all([
      this.requestManager.get('/api/sources/names', []),
      this.requestManager.get(`/api/data/${this.source}`)
    ])
    this.meta = data.meta
    return this.loadData(sources, Number(data.correction), data.schedules, data.calendar)
  }

  public refresh (refreshInterval: number) {
    if (!this.refreshing) {
      return
    }
    this.currentTimeout = setTimeout(async () => {
      try {
        await this.reloadData()
      } catch (e) {
        // probably fine, just try again next time
      }
      this.refresh(refreshInterval)
    }, refreshInterval)
  }

  public async initialize (refreshInterval: number = 4 * 60 * 1000) {
    if (!this.initialized) {
      await this.reloadData()
      this.initialized = true
    }

    this.refreshing = true
    this.refresh(refreshInterval)
  }

  public stopRefreshing () {
    this.refreshing = false
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout)
    }
  }

  public getTimeRemainingMs (): number {
    return this.calculator.getTimeRemainingMs(this.date)
  }

  public getTimeRemainingString (): string {
    return this.calculator.getTimeRemainingString(this.date)
  }

  public getProportionElapsed (): number {
    return this.calculator.getProportionElapsed(this.date)
  }

  public getNextPeriod (): IPeriodObject {
    return this.calculator.getNextPeriod(this.date)
  }

  public getPreviousPeriod (): IPeriodObject {
    return this.calculator.getPreviousPeriod(this.date)
  }

  public getCurrentPeriod (): IPeriodObject {
    return this.calculator.getCurrentPeriod(this.date)
  }

  public getCompletedPeriods (): IPeriodObject[] {
    return this.calculator.getCompletedPeriods(this.date)
  }

  public getFuturePeriods (): IPeriodObject[] {
    return this.calculator.getFuturePeriods(this.date)
  }

  public getCurrentSchedule (): Schedule {
    return this.calculator.getCurrentSchedule(this.date)
  }
}
