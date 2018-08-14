import { IBindings } from './FormatString'
import { concat, drop, lex, remove, trim } from './Lexer'
import Period from './Period'
import Schedule from './Schedule'

interface IScheduleHeader {
  display: string,
  name: string
}

function parseLine (line: string): Period | IScheduleHeader {
  const lexed = drop(' ', lex(line))
  const head = lexed[0]
  let tokens = lexed.slice(1)
  if (head === '*') {
    // it is a schedule header
    tokens = trim(' ', tokens)
    const name = tokens[0]
    tokens = tokens.slice(1)
    tokens = trim(' ', tokens)
    tokens = tokens.slice(1)
    tokens = trim(' ', tokens)
    const display = concat(tokens)
    return {
      display: display || name,
      name
    }
  } else {
    // it is a schedule entry
    const [hour, min] = head.split(':')
    const time = {
      hour: parseInt(hour, 10),
      min: parseInt(min, 10)
    }
    const formatString = concat(trim(' ', tokens))
    return new Period(time, formatString)
  }
}

export default function parse (str: string, bindings: IBindings = {}): { [name: string]: Schedule } {
  str = remove('\r', str)
  const split = str.split('\n').filter((line) => line.length > 0)
  const lines = split.map(parseLine)

  const schedules: { [name: string]: Schedule } = {}
  let schedule: IScheduleHeader | null = null
  let periods: Period[] = []
  for (const line of lines) {
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
