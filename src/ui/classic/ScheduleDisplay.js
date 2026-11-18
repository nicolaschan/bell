const m = require('mithril')

var ScheduleDisplay = {
  view: function (vnode) {
    var bellTimer = vnode.attrs.bellTimer

    var completed = bellTimer.getCompletedPeriods()
    var current = bellTimer.getCurrentPeriod()
    var future = bellTimer.getFuturePeriods()

    var displayTimeArray = function (timeArray) {
      timeArray = [timeArray.hour, timeArray.min]

      var hours = ((timeArray[0] === 0) ? 12 : (timeArray[0] > 12) ? timeArray[0] % 12 : timeArray[0]).toString()
      var minutes = timeArray[1].toString()
      if (minutes.length < 2) { minutes = '0' + minutes }
      return hours + ':' + minutes
    }

    var numberOfCompletedPeriods = 2
    var numberOfFuturePeriods = 5
    var totalPeriods = numberOfCompletedPeriods + numberOfFuturePeriods

    if (future.length < numberOfFuturePeriods) {
      numberOfFuturePeriods = future.length
      numberOfCompletedPeriods = totalPeriods - numberOfFuturePeriods
    }
    if (completed.length < numberOfCompletedPeriods) {
      numberOfCompletedPeriods = completed.length
      numberOfFuturePeriods = totalPeriods - numberOfCompletedPeriods
    }

    completed = completed.slice(completed.length - numberOfCompletedPeriods)
    future = future.slice(0, numberOfFuturePeriods)

    if (!completed.length && !future.length && current.name === 'Free') {
      return m('.centered', m('.no-classes', 'No classes today'))
    }

    var rows = []
    for (let period of completed) { rows.push(m('tr.completed', [m('td.time', displayTimeArray(period.time)), m('td', period.name)])) }
    if (current) {
      rows.push(m('tr.current', [m('td.time', displayTimeArray({
        hour: bellTimer.date.getHours(),
        min: bellTimer.date.getMinutes()
      })), m('td', current.name)]))
    }
    for (let period of future) { rows.push(m('tr.future', [m('td.time', displayTimeArray(period.time)), m('td', period.name)])) }

    return m('.centered', m('table', rows))
  }
}

module.exports = ScheduleDisplay
