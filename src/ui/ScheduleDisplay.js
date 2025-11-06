const m = require('mithril')
const ReminderModal = require('./ReminderModal')
const RemindersDisplay = require('./RemindersDisplay')

var ScheduleDisplay = {
  oninit: function (vnode) {
    vnode.state.weeklyView = false
    vnode.state.weekOffset = 0 // 0 = current week, -1 = previous week, +1 = next week
    vnode.state.modalOpen = false
    vnode.state.selectedPeriod = null
    vnode.state.selectedDate = null
  },
  view: function (vnode) {
    var bellTimer = vnode.attrs.bellTimer

    var displayTimeArray = function (timeArray) {
      timeArray = [timeArray.hour, timeArray.min]

      var hours = ((timeArray[0] === 0) ? 12 : (timeArray[0] > 12) ? timeArray[0] % 12 : timeArray[0]).toString()
      var minutes = timeArray[1].toString()
      if (minutes.length < 2) { minutes = '0' + minutes }
      return hours + ':' + minutes
    }

    var toggleButton = m('button.view-toggle', {
      onclick: function () {
        vnode.state.weeklyView = !vnode.state.weeklyView
      }
    }, vnode.state.weeklyView ? 'Daily View' : 'Weekly View')

    if (vnode.state.weeklyView) {
      // Weekly view logic
      var today = new Date(bellTimer.date)
      var currentDay = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      
      // Calculate the start of the week (Monday) with offset
      var daysFromMonday = currentDay === 0 ? -6 : 1 - currentDay
      var monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysFromMonday + (vnode.state.weekOffset * 7))
      
      var weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      var weekSchedules = []
      
      // Find the earliest and latest times across all days
      var earliestMinutes = Infinity
      var latestMinutes = 0
      
      for (let i = 0; i < 5; i++) {
        var date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
        var schedule = bellTimer.calculator.getCurrentSchedule(date)
        
        for (let period of schedule.periods) {
          var periodMinutes = period.time.hour * 60 + period.time.min
          if (periodMinutes < earliestMinutes) earliestMinutes = periodMinutes
          if (periodMinutes > latestMinutes) latestMinutes = periodMinutes
        }
      }
      
      // Add some padding
      earliestMinutes = Math.floor(earliestMinutes / 60) * 60 // Round down to nearest hour
      latestMinutes = Math.ceil(latestMinutes / 60) * 60 + 60 // Round up and add an hour
      var totalMinutes = latestMinutes - earliestMinutes
      
      for (let i = 0; i < 5; i++) {
        var date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
        var schedule = bellTimer.calculator.getCurrentSchedule(date)
        var periods = schedule.periods
        
        var isToday = date.getDate() === today.getDate() && 
                      date.getMonth() === today.getMonth() && 
                      date.getFullYear() === today.getFullYear()
        
        // Calculate period positions and heights
        var periodBlocks = []
        for (let j = 0; j < periods.length; j++) {
          var period = periods[j]
          var periodName = period.display(bellTimer.bindings || {})
          
          // Filter out Free periods and Passing periods from DISPLAY only
          if (periodName !== 'Free' && 
              periodName !== 'Passing to Free' && 
              !periodName.startsWith('Passing to ')) {
            
            var startMinutes = period.time.hour * 60 + period.time.min
            
            // Find the end time by looking at the VERY NEXT period (including passing periods)
            // This ensures accurate timing with natural gaps where passing periods exist
            var endMinutes
            if (j + 1 < periods.length) {
              var nextPeriod = periods[j + 1]
              endMinutes = nextPeriod.time.hour * 60 + nextPeriod.time.min
            } else {
              // Last period - assume 45 min duration
              endMinutes = startMinutes + 45
            }
            
            var topPercent = ((startMinutes - earliestMinutes) / totalMinutes) * 100
            var heightPercent = ((endMinutes - startMinutes) / totalMinutes) * 100
            var durationMinutes = endMinutes - startMinutes
            
            // Only show periods that are 30 minutes or longer
            if (durationMinutes >= 30) {
              periodBlocks.push({
                name: periodName,
                time: displayTimeArray(period.time),
                topPercent: topPercent,
                heightPercent: heightPercent,
                originalPeriod: period
              })
            }
          }
        }
        
        weekSchedules.push({
          day: weekDays[i],
          date: date,
          schedule: schedule,
          periods: periodBlocks,
          isToday: isToday
        })
      }
      
      // Build time labels for the left axis
      var timeLabels = []
      for (let hour = Math.floor(earliestMinutes / 60); hour <= Math.ceil(latestMinutes / 60); hour++) {
        var minutes = hour * 60
        var topPercent = ((minutes - earliestMinutes) / totalMinutes) * 100
        var displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
        var ampm = hour >= 12 ? 'PM' : 'AM'
        timeLabels.push({
          time: displayHour + ':00 ' + ampm,
          topPercent: topPercent
        })
      }
      
      // Build weekly view
      var weeklyContent = m('.weekly-schedule-container', [
        m('.weekly-header-row', [
          m('.time-axis-header', ''),
          weekSchedules.map(function (daySchedule) {
            var dateStr = (daySchedule.date.getMonth() + 1) + '/' + daySchedule.date.getDate()
            return m('.weekly-day-header' + (daySchedule.isToday ? '.today' : ''), [
              m('.day-name', daySchedule.day + ' ' + dateStr),
              m('.schedule-name', daySchedule.schedule.display)
            ])
          })
        ]),
        m('.weekly-grid-container', [
          m('.time-axis', timeLabels.map(function (label) {
            return m('.time-label', {
              style: { top: label.topPercent + '%' }
            }, label.time)
          })),
          m('.weekly-grid', weekSchedules.map(function (daySchedule) {
            return m('.weekly-day-column' + (daySchedule.isToday ? '.today' : ''), [
              daySchedule.periods.map(function (period) {
                return m('.period-block', {
                  style: {
                    top: period.topPercent + '%',
                    height: period.heightPercent + '%'
                  },
                  onclick: function () {
                    vnode.state.selectedPeriod = {
                      name: period.name,
                      time: period.originalPeriod.time
                    }
                    vnode.state.selectedDate = daySchedule.date
                    vnode.state.modalOpen = true
                  }
                }, [
                  m('.period-name', period.name),
                  m('.period-time', period.time)
                ])
              })
            ])
          }))
        ])
      ])
      
      var weekNavigation = m('.week-navigation', [
        m('button.week-nav-button', {
          onclick: function () {
            vnode.state.weekOffset--
          }
        }, '← Previous Week'),
        m('button.week-nav-button.current-week', {
          onclick: function () {
            vnode.state.weekOffset = 0
          },
          disabled: vnode.state.weekOffset === 0
        }, 'Current Week'),
        m('button.week-nav-button', {
          onclick: function () {
            vnode.state.weekOffset++
          }
        }, 'Next Week →')
      ])
      
      return [
        m(RemindersDisplay, { bellTimer: bellTimer }),
        m('.centered.schedule-container', [
          toggleButton,
          weekNavigation,
          weeklyContent
        ]),
        m(ReminderModal, {
          isOpen: vnode.state.modalOpen,
          period: vnode.state.selectedPeriod,
          date: vnode.state.selectedDate,
          onClose: function () {
            vnode.state.modalOpen = false
          }
        })
      ]
    } else {
      // Daily view logic (original)
      var completed = bellTimer.getCompletedPeriods()
      var current = bellTimer.getCurrentPeriod()
      var future = bellTimer.getFuturePeriods()

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
        return [
          m(RemindersDisplay, { bellTimer: bellTimer }),
          m('.centered.schedule-container', [
            toggleButton,
            m('.no-classes', 'No classes today')
          ])
        ]
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

      return [
        m(RemindersDisplay, { bellTimer: bellTimer }),
        m('.centered.schedule-container', [
          toggleButton,
          m('table', rows)
        ])
      ]
    }
  }
}

module.exports = ScheduleDisplay
