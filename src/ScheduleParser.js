const {
  lex,
  drop,
  trim,
  concat,
  remove
} = require('./Lexer')

const Schedule = require('./Schedule')
const Period = require('./Period')

var parseLine = function (line) {
  var [head, ...tokens] = drop(' ', lex(line))
  if (head === '*') {
    // it is a schedule header
    tokens = trim(' ', tokens)
    var name = tokens[0]
    tokens = tokens.slice(1)
    tokens = trim(' ', tokens)
    tokens = tokens.slice(1)
    tokens = trim(' ', tokens)
    var display = concat(tokens)
    return {
      name: name,
      display: display || name
    }
  } else {
    // it is a schedule entry
    var [hour, min] = head.split(':')
    var time = {
      hour: parseInt(hour),
      min: parseInt(min)
    }
    var formatString = concat(trim(' ', tokens))
    return new Period(time, formatString)
  }
}
var parse = function (str, bindings = {}) {
  str = remove('\r', str)
  var lines = str.split('\n').filter(line => line.length > 0)
  lines = lines.map(parseLine)

  var schedules = {}
  var schedule
  var periods = []
  for (let line of lines) {
    if (line instanceof Period) {
      periods.push(line)
    } else {
      if (schedule) { schedules[schedule.name] = new Schedule(schedule.name, schedule.display, periods, bindings) }
      schedule = line
      periods = []
    }
  }
  if (schedule) { schedules[schedule.name] = new Schedule(schedule.name, schedule.display, periods, bindings) }
  return schedules
}

module.exports = parse
