/* global timesync */

const $ = require('jquery')

const BellCalculator = require('./BellCalculator').default
const getCustomCalendar = require('./CustomSchedule').getCustomCalendar

class BellTimer {
  constructor (cookieManager, requestManager) {
    this.cookieManager = cookieManager
    this.requestManager = requestManager

    this.debug = function () {}
    this.devMode = false
    this.startTime = 0
    this.timeScale = 1

    var devModeCookie = this.cookieManager.get('dev_mode')
    if (devModeCookie) {
      this.enableDevMode(devModeCookie.startDate, devModeCookie.scale)
    }
  }

  loadCustomCourses () {
    this.setCorrection(0)
    this.calendar = getCustomCalendar(this.cookieManager.get('courses'))
  }

  loadData (dataSource, sources, version, correction, schedules, calendar) {
    if (sources.indexOf(dataSource) < 0) {
      this.cookieManager.remove('source')
      return this.loadData(dataSource, sources, version, correction, schedules, calendar)
    }

    this.source = dataSource

    if (this.version && this.version !== version) {
      // Give IndexedDB time to write (TODO: make more robust)
      setTimeout(() => $(window)[0].location.reload(), 1000)
    } else { this.version = version }

    this.setCorrection(parseInt(correction))

    var parseSchedules = require('./ScheduleParser').default
    var parseCalendar = require('./CalendarParser').default

    schedules = parseSchedules(schedules, this.cookieManager.get('periods'))
    calendar = parseCalendar(calendar, schedules)

    this.calendar = calendar
  }

  set calendar (calendar) {
    this.calculator = new BellCalculator(calendar)
  }

  get calendar () {
    return this.calculator.calendar
  }

  set source (value) {
    this.cookieManager.set('source', value)
  }

  get source () {
    return this.cookieManager.get('source')
  }

  async reloadData () {
    var dataSource = this.cookieManager.get('source', 'lahs')
    if (dataSource === 'custom') {
      this.source = dataSource
      return this.loadCustomCourses()
    }

    var [sources, version, correction, schedules, calendar] = await Promise.all([
      this.requestManager.get('/api/sources/names', []),
      this.requestManager.get('/api/version'),
      this.requestManager.get(`/api/data/${dataSource}/correction`, '0'),
      this.requestManager.get(`/api/data/${dataSource}/schedules`),
      this.requestManager.get(`/api/data/${dataSource}/calendar`)
    ])

    return this.loadData(dataSource, sources, version, correction, schedules, calendar)
  }

  async initialize () {
    return Promise.all([
      this.reloadData(),
      this.initializeTimesync()
    ])
  }

  async initializeTimesync () {
    if (typeof timesync === 'undefined') {
      this.ts = Date
      console.warn('Timesync not found')
      return this.ts
    }

    var ts = timesync.create({
      // Full URL is necessary for Chrome extension
      // If not building Chrome extension,
      // server can be changed to '/timesync'
      server: '/timesync',
      interval: 4 * 60 * 1000
    })

    ts.on('change', offset =>
      this.debug('Timesync offset: ' + offset))

    this.ts = ts

    return new Promise((resolve, reject) =>
      ts.on('sync', () => resolve(ts)))
  }

  setCorrection (correction) {
    this.correction = correction
  }

  getCorrection () {
    return this.correction
  }

  enableDevMode (startDate, scale) {
    console.warn('You are in Developer Mode, at ' + scale + 'x speed! Disable with `bellTimer.disableDevMode()`')

    this.devMode = true
    this.startTime = new Date(startDate).getTime()
    this.devModeStartTime = Date.now()
    this.timeScale = scale

    this.cookieManager.set('dev_mode', {
      enabled: this.devMode,
      startDate: startDate,
      scale: scale
    })
  }

  disableDevMode () {
    this.devMode = false
    this.cookieManager.remove('dev_mode')
  }

  getDate () {
    if (this.devMode) {
      return new Date((this.startTime + ((Date.now() - this.devModeStartTime) * this.timeScale) + this.correction))
    }
    if (!this.ts) { this.ts = Date }
    return new Date(this.ts.now() + this.correction)
  }

  getTimeRemainingMs () {
    return this.calculator.getTimeRemainingMs(this.getDate())
  }

  getTimeRemainingString () {
    return this.calculator.getTimeRemainingString(this.getDate())
  }

  getProportionElapsed () {
    return this.calculator.getProportionElapsed(this.getDate())
  }

  getNextPeriod () {
    return this.calculator.getNextPeriod(this.getDate())
  }
  getPreviousPeriod () {
    return this.calculator.getPreviousPeriod(this.getDate())
  }
  getCurrentPeriod () {
    return this.calculator.getCurrentPeriod(this.getDate())
  }

  getCompletedPeriods () {
    return this.calculator.getCompletedPeriods(this.getDate())
  }

  getFuturePeriods () {
    return this.calculator.getFuturePeriods(this.getDate())
  }

  getCurrentSchedule (date) {
    if (!date) date = this.getDate()
    return this.calculator.getCurrentSchedule(date)
  }
}

module.exports = BellTimer
