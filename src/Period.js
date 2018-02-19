const format = require('./FormatString')

class Period {
  constructor (time, formatString) {
    this.time = time
    this.formatString = formatString
  }

  display (bindings = {}) {
    return format(this.formatString, bindings)
  }

  getTimestamp (date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      this.time.hour,
      this.time.min,
      0, 0)
  }
}

module.exports = Period
