import { default as Calendar, ISpecialSchedules, IWeeklySchedules } from './Calendar'
import { concat, drop, dropEnd, lex, remove, trim } from './Lexer'
import Schedule from './Schedule'

export default function (str: string, schedules: { [name: string]: Schedule }) {
  str = remove('\r', str)
  const split = str.split('\n')
  const lines: string[][] = split.map((line) => drop(' ', lex(line)))

  const week: IWeeklySchedules = {}
  const special: ISpecialSchedules = {}

  let section: string | null = null
  for (let line of lines) {
    line = drop(' ', line)
    if (line.length < 1) { continue }

    const head = line[0]
    let tail = line.slice(1)
    tail = dropEnd(' ', drop(' ', tail))

    if (head === '*') {
      section = tail.reduce((a, b) => a.concat(b))
      continue
    }

    tail = trim(' ', tail)
    const name = tail[0]
    tail = tail.slice(1)
    tail = trim(' ', tail)
    tail = tail.slice(1)
    tail = trim(' ', tail)
    const display = concat(tail)
    if (section === 'Default Week') {
      week[head] = {
        display, name
      }
      if (!week[head].display) { delete week[head].display }
    }
    if (section === 'Special Days') {
      special[head] = {
        display, name
      }
      if (!special[head].display) { delete special[head].display }
    }
  }

  return new Calendar(week, special, schedules)
}
