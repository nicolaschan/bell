/* global localStorage */

const m = require('mithril')

var ReminderModal = {
  oninit: function (vnode) {
    vnode.state.reminderText = ''
  },

  onbeforeupdate: function (vnode) {
    // Reset text when modal closes
    if (!vnode.attrs.isOpen) {
      vnode.state.reminderText = ''
    }
  },

  getReminderKey: function (date, periodName, periodTime) {
    var dateStr = date.getFullYear() + '-' +
                  String(date.getMonth() + 1).padStart(2, '0') + '-' +
                  String(date.getDate()).padStart(2, '0')
    return dateStr + '|' + periodName + '|' + periodTime.hour + ':' + periodTime.min
  },

  getReminders: function (key) {
    var allReminders = JSON.parse(localStorage.getItem('bellReminders') || '{}')
    return allReminders[key] || []
  },

  getAllReminders: function () {
    return JSON.parse(localStorage.getItem('bellReminders') || '{}')
  },

  saveReminder: function (key, reminder) {
    var allReminders = JSON.parse(localStorage.getItem('bellReminders') || '{}')
    if (!allReminders[key]) {
      allReminders[key] = []
    }
    allReminders[key].push({
      text: reminder,
      createdAt: new Date().toISOString(),
      completed: false
    })
    localStorage.setItem('bellReminders', JSON.stringify(allReminders))
  },

  toggleComplete: function (key, index) {
    var allReminders = JSON.parse(localStorage.getItem('bellReminders') || '{}')
    if (allReminders[key] && allReminders[key][index]) {
      allReminders[key][index].completed = !allReminders[key][index].completed
      localStorage.setItem('bellReminders', JSON.stringify(allReminders))
    }
  },

  deleteReminder: function (key, index) {
    var allReminders = JSON.parse(localStorage.getItem('bellReminders') || '{}')
    if (allReminders[key]) {
      allReminders[key].splice(index, 1)
      if (allReminders[key].length === 0) {
        delete allReminders[key]
      }
      localStorage.setItem('bellReminders', JSON.stringify(allReminders))
    }
  },

  view: function (vnode) {
    if (!vnode.attrs.isOpen) return null

    var period = vnode.attrs.period
    var date = vnode.attrs.date
    var onClose = vnode.attrs.onClose

    var reminderKey = ReminderModal.getReminderKey(date, period.name, period.time)

    // Load reminders fresh every time the view renders
    var existingReminders = ReminderModal.getReminders(reminderKey)

    var handleAddReminder = function () {
      if (vnode.state.reminderText.trim()) {
        ReminderModal.saveReminder(reminderKey, vnode.state.reminderText.trim())
        vnode.state.reminderText = ''
        m.redraw()
      }
    }

    var handleDeleteReminder = function (index) {
      ReminderModal.deleteReminder(reminderKey, index)
      m.redraw()
    }

    var dateStr = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()

    // Format time properly
    var timeStr = ''
    if (period.time) {
      var hours = ((period.time.hour === 0) ? 12 : (period.time.hour > 12) ? period.time.hour % 12 : period.time.hour).toString()
      var minutes = period.time.min.toString()
      if (minutes.length < 2) { minutes = '0' + minutes }
      var ampm = period.time.hour >= 12 ? 'PM' : 'AM'
      timeStr = hours + ':' + minutes + ' ' + ampm
    }

    return m('.modal-overlay', {
      onclick: function (e) {
        if (e.target.className === 'modal-overlay') {
          onClose()
        }
      }
    }, [
      m('.modal-content', [
        m('.modal-header', [
          m('h2.modal-title', 'Reminders for ' + period.name),
          m('.modal-subtitle', dateStr + ' at ' + timeStr),
          m('a.dismiss.modal-close', {
            href: '#',
            onclick: function (e) {
              e.preventDefault()
              onClose()
            }
          }, [
            m('i.material-icons.dismiss-icon', 'close')
          ])
        ]),
        m('.modal-body', [
          existingReminders.length > 0 ? [
            m('.existing-reminders', [
              m('h3', 'Current Reminders'),
              m('ul.reminder-list',
                existingReminders.map(function (reminder, index) {
                  return m('li.reminder-item', [
                    m('span.reminder-text', reminder.text),
                    m('a.delete-reminder', {
                      href: '#',
                      onclick: function (e) {
                        e.preventDefault()
                        handleDeleteReminder(index)
                      }
                    }, [
                      m('i.material-icons', 'delete')
                    ])
                  ])
                })
              )
            ])
          ] : m('.no-reminders', 'No reminders yet'),
          m('.add-reminder-section', [
            m('h3', 'Add New Reminder'),
            m('textarea.reminder-input', {
              placeholder: 'Enter your reminder...',
              value: vnode.state.reminderText,
              oninput: function (e) {
                vnode.state.reminderText = e.target.value
              },
              onkeydown: function (e) {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault()
                  handleAddReminder()
                }
              }
            }),
            m('button.add-reminder-button', {
              onclick: handleAddReminder,
              disabled: !vnode.state.reminderText.trim()
            }, 'Add Reminder')
          ])
        ])
      ])
    ])
  }
}

module.exports = ReminderModal
