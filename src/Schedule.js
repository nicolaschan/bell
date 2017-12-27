class Schedule {
  constructor (name, display, periods, bindings = {}) {
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

  overrideDisplay (display) {
    if (!display) { return this }
    return new Schedule(this.name, display, this.periods, this.bindings)
  }

  getCurrentPeriodIndex (date) {
    var time = {
      hour: date.getHours(),
      min: date.getMinutes()
    }

    for (let i in this.periods) {
      let period = this.periods[i]
      if (period.time.hour > time.hour) { return i - 1 }
      if (period.time.hour >= time.hour && period.time.min > time.min) { return i - 1 }
    }
    return this.periods.length - 1
  }

  getPeriodByIndex (i, date) {
    var period = this.periods[i]

    if (period) {
      return {
        time: period.time,
        name: period.display(this.bindings),
        timestamp: period.getTimestamp(date)
      }
    }
  }

  getFirstPeriod (date) {
    return this.getPeriodByIndex(0, date)
  }
  getLastPeriod (date) {
    return this.getPeriodByIndex(this.length - 1, date)
  }

  getCurrentPeriod (date) {
    return this.getPeriodByIndex(this.getCurrentPeriodIndex(date), date)
  }
  getNextPeriod (date) {
    return this.getPeriodByIndex(this.getCurrentPeriodIndex(date) + 1, date)
  }
  getPreviousPeriod (date) {
    return this.getPeriodByIndex(this.getCurrentPeriodIndex(date) - 1, date)
  }
}

module.exports = Schedule
