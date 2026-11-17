const m = require('mithril')
const Icon = require('./Icon')
const { formatTime, formatDateTime } = require('./format')

// Passing time and free time are part of the countdown but are not
// listed as their own rows in the schedule.
const isBreak = name => /^passing\b/i.test(name) || /^free$/i.test(name)

const sameDay = (a, b) => a.toDateString() === b.toDateString()

// Turn bell's list of period start times into rows with a start and end time.
const buildRows = bellTimer => {
  const date = bellTimer.date
  const completed = bellTimer.getCompletedPeriods()
  const future = bellTimer.getFuturePeriods()
  const current = bellTimer.getCurrentPeriod()
  const currentIsToday = current && sameDay(current.timestamp, date)

  const periods = completed.concat(currentIsToday ? [current] : [], future)
  const currentIndex = currentIsToday ? completed.length : -1

  const rows = []
  periods.forEach((period, i) => {
    const next = periods[i + 1]
    if (isBreak(period.name) || !next) {
      return
    }
    rows.push({
      name: period.name,
      start: period.time,
      end: next.time,
      state: i < currentIndex ? 'completed' : (i === currentIndex ? 'current' : 'future')
    })
  })
  return { rows, inClass: currentIsToday && !isBreak(current.name) }
}

const Row = {
  view (vnode) {
    const { row } = vnode.attrs
    return m(`.schedule-row.${row.state}`, [
      m('.schedule-times', [
        m('span.start', formatTime(row.start.hour, row.start.min)),
        m('span.dash', '–'),
        m('span.end', formatTime(row.end.hour, row.end.min))
      ]),
      m('.schedule-name', row.name)
    ])
  }
}

const Divider = {
  view (vnode) {
    if (!vnode.attrs.label) {
      return m('.schedule-divider', m('.rule'))
    }
    return m('.schedule-divider', [
      m('.rule.short'),
      m('.label', vnode.attrs.label),
      m('.rule')
    ])
  }
}

const ScheduleView = {
  view (vnode) {
    const { bellTimer, onclose } = vnode.attrs
    const { rows, inClass } = buildRows(bellTimer)
    const completed = rows.filter(row => row.state === 'completed')
    const upcoming = rows.filter(row => row.state !== 'completed')

    let body
    if (rows.length === 0) {
      body = m('.schedule-empty', 'No classes today')
    } else {
      body = [
        completed.map(row => m(Row, { row })),
        upcoming.length ? m(Divider, { label: inClass ? null : 'Coming up...' }) : null,
        upcoming.map(row => m(Row, { row }))
      ]
    }

    return m('.schedule-page', { role: 'dialog', 'aria-label': 'Schedule' }, [
      m('header.page-header', [
        m('.header-title', formatDateTime(bellTimer.date)),
        m('button.icon-button.close-button[type=button]', {
          'aria-label': 'Back to timer',
          onclick: onclose
        }, m(Icon, { name: 'close', size: 28 }))
      ]),
      m('.schedule-list', body)
    ])
  }
}

module.exports = ScheduleView
