const m = require('mithril')

var RemindersDisplay = {
  oninit: function (vnode) {
    vnode.state.isExpanded = false
  },
  
  view: function (vnode) {
    var bellTimer = vnode.attrs.bellTimer
    var ReminderModal = require('./ReminderModal')
    
    // Get all reminders
    var allReminders = ReminderModal.getAllReminders()
    
    // Get today's date
    var today = new Date(bellTimer.date)
    today.setHours(0, 0, 0, 0)
    
    // Get reminders for the next 5 days
    var upcomingReminders = []
    
    for (var i = 0; i < 5; i++) {
      var checkDate = new Date(today)
      checkDate.setDate(today.getDate() + i)
      
      var dateStr = checkDate.getFullYear() + '-' + 
                    String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(checkDate.getDate()).padStart(2, '0')
      
      // Find all reminders for this date
      Object.keys(allReminders).forEach(function (key) {
        if (key.startsWith(dateStr)) {
          var parts = key.split('|')
          var periodName = parts[1]
          var periodTime = parts[2]
          
          allReminders[key].forEach(function (reminder, reminderIndex) {
            upcomingReminders.push({
              date: checkDate,
              dateStr: dateStr,
              periodName: periodName,
              periodTime: periodTime,
              reminderText: reminder.text,
              completed: reminder.completed || false,
              isToday: i === 0,
              daysAway: i,
              reminderKey: key,
              reminderIndex: reminderIndex
            })
          })
        }
      })
    }
    
    // Sort by completion status first (incomplete first), then date and time
    upcomingReminders.sort(function (a, b) {
      // Sort by completed status first (false before true)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      // Then by date
      if (a.dateStr !== b.dateStr) {
        return a.dateStr.localeCompare(b.dateStr)
      }
      // Then by time
      return a.periodTime.localeCompare(b.periodTime)
    })
    
    if (upcomingReminders.length === 0) {
      return null
    }
    
    return m('.reminders-display' + (vnode.state.isExpanded ? '.expanded' : '.collapsed'), [
      m('.reminders-header', {
        onclick: function () {
          vnode.state.isExpanded = !vnode.state.isExpanded
        }
      }, [
        m('i.material-icons.reminder-icon', 'notifications'),
        m('h3', 'Reminders (' + upcomingReminders.length + ')'),
        m('i.material-icons.expand-icon', vnode.state.isExpanded ? 'expand_less' : 'expand_more')
      ]),
      vnode.state.isExpanded ? m('.reminders-list-container',
        upcomingReminders.map(function (reminder) {
          var dayLabel = reminder.isToday ? 'Today' : 
                        reminder.daysAway === 1 ? 'Tomorrow' :
                        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][reminder.date.getDay()]
          
          var displayDate = (reminder.date.getMonth() + 1) + '/' + reminder.date.getDate()
          
          var handleToggleComplete = function (e) {
            e.stopPropagation()
            ReminderModal.toggleComplete(reminder.reminderKey, reminder.reminderIndex)
            m.redraw()
          }
          
          var handleDelete = function (e) {
            e.stopPropagation()
            ReminderModal.deleteReminder(reminder.reminderKey, reminder.reminderIndex)
            m.redraw()
          }
          
          return m('.reminder-card' + (reminder.isToday ? '.today' : '') + (reminder.completed ? '.completed' : ''), [
            m('.reminder-card-header', [
              m('.reminder-date', [
                m('span.day-label', dayLabel),
                m('span.date-label', displayDate)
              ]),
              m('.reminder-period', [
                m('span.period-time', reminder.periodTime),
                m('span.period-name', reminder.periodName)
              ])
            ]),
            m('.reminder-card-body', [
              m('.reminder-text', reminder.reminderText),
              m('.reminder-actions', [
                m('button.reminder-action-btn.complete-btn', {
                  onclick: handleToggleComplete,
                  title: reminder.completed ? 'Mark as incomplete' : 'Mark as complete'
                }, [
                  m('i.material-icons', reminder.completed ? 'undo' : 'check')
                ]),
                m('button.reminder-action-btn.delete-btn', {
                  onclick: handleDelete,
                  title: 'Delete reminder'
                }, [
                  m('i.material-icons', 'delete')
                ])
              ])
            ])
          ])
        })
      ) : null
    ])
  }
}

module.exports = RemindersDisplay

