const {
    lex,
    drop,
    dropEnd,
    trim,
    concat,
    remove
} = require('./Lexer')
const Calendar = require('./Calendar')

var parse = function (str, schedules) {
  str = remove('\r', str)
  var lines = str.split('\n')
  lines = lines.map(line => drop(' ', lex(line)))

  var week = {}
  var special = {}

  var section
  for (let line of lines) {
    line = drop(' ', line)
    if (line.length < 1) { continue }

    var [head, ...tail] = line
    tail = dropEnd(' ', drop(' ', tail))

    if (head === '*') {
      tail = tail.reduce((a, b) => a.concat(b))
      section = tail
      continue
    }

    tail = trim(' ', tail)
    let name = tail[0]
    tail = tail.slice(1)
    tail = trim(' ', tail)
    tail = tail.slice(1)
    tail = trim(' ', tail)
    let display = concat(tail)
    if (section === 'Default Week') {
      week[head] = {
        name: name,
        display: display
      }
      if (!week[head].display) { delete week[head].display }
    }
    if (section === 'Special Days') {
      special[head] = {
        name: name,
        display: display
      }
      if (!special[head].display) { delete special[head].display }
    }
  }

  return new Calendar(week, special, schedules)
}

module.exports = parse
