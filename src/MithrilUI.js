const m = require('mithril')
const root = document.body
const $ = require('jquery')

var ScheduleDisplay = {
  view: function (vnode) {
    var bellTimer = vnode.attrs.model.bellTimer

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
      return m('.no-classes', 'No classes today')
    }

    var rows = []
    for (let period of completed) { rows.push(m('tr.completed', [m('td.time', displayTimeArray(period.time)), m('td', period.name)])) }
    if (current) {
      rows.push(m('tr.current', [m('td.time', displayTimeArray({
        hour: bellTimer.getDate().getHours(),
        min: bellTimer.getDate().getMinutes()
      })), m('td', current.name)]))
    }
    for (let period of future) { rows.push(m('tr.future', [m('td.time', displayTimeArray(period.time)), m('td', period.name)])) }

    return m('table', rows)
  }
}

var Page1 = require('./ui/Page1')
var Popup = {
  view: function (vnode) {
    var model = vnode.attrs.model
    if (!model.popupModel.visible) { return }
    var bellTimer = model.bellTimer
    var theme = model.themeManager.currentTheme.theme(bellTimer)

    return m('span', {
      style: {
        visibility: (model.popupModel.visible) ? 'visible' : 'hidden' }
    }, m('.top.right.popup.fade-in', {
      style: theme.contrast
    }, m('table', m('tr', [
      m('td', m(`${model.popupModel.href ? 'a.link' : 'span'}.center-vertical[target=_blank]`, {
        href: model.popupModel.href,
        style: theme.subtext
      }, model.popupModel.text)),
      m('td', m('a.dismiss.center-vertical[href="#"]', {
        onclick: function () {
          model.popupModel.visible = false
        }
      }, m('i.dismiss-icon.material-icons', 'cancel')))
    ]))))
  }
}
var SchoolIndicator = {
  view: function (vnode) {
    var model = vnode.attrs.model
    var source = model.bellTimer.source
    var theme = model.themeManager.currentTheme.theme(model.bellTimer)
    var meta = model.requestManager.getSync(`/api/data/${source}/meta`)
    if (!meta) { return }

    return m('.top.left.popup.school-indicator', m('table', m('tr', [
      m('td', m('a.no-decoration.center-vertical', {
        href: '/settings',
        style: theme.subtext
      }, meta.name))
    ])))
  }
}

class MithrilUI {
  constructor (uiModel) {
    this.uiModel = uiModel

    m.mount(root, {
      view: function () {
        if (!uiModel.state.ready) {
          if (!uiModel.state.errorMessage.visible) {
            return m('.centered.loading', [
              m('i.material-icons.loading-icon.spin', 'sync'),
              m('br'),
              m('.loading-message', uiModel.state.loadingMessage.value)
            ])
          }
          return m('.centered.loading', [
            m('i.material-icons.loading-icon', 'error_outline'),
            m('br'),
            m('.loading-message', uiModel.state.errorMessage.value)
          ])
        }
        return [m('span', {
          style: {
            'font-size': (Math.min(window.innerHeight * 0.3, window.innerWidth * 0.2) * 0.1) + 'px'
          }
        }, [m(Page1, {
          model: uiModel
        }), m('.container#page2', [
          m('.centered', [
            m(ScheduleDisplay, {
              model: uiModel
            })
          ]),
          m('.footer-right', (navigator.onLine) ? m('a[href=/settings]',
                        m('i.settings-icon.material-icons', 'settings')) : m('span', 'Settings not available offline'))
        ]), m(Popup, {
          model: uiModel
        }), m(SchoolIndicator, {
          model: uiModel
        }), m('i.down-arrow.pulse.material-icons', {
          onclick: function () {
            $('body, html').animate({
              scrollTop: $('#page2').offset().top
            }, 1500)
          },
          oninit: function () {
            if (uiModel.cookieManager.get('has_scrolled')) { return }
            $(window).on('scroll', function (e) {
              if ($(window).scrollTop() > 250) {
                $(window).off('scroll')
                uiModel.cookieManager.set('has_scrolled', true)
              }
            })
          },
          style: {
            visibility: uiModel.cookieManager.get('has_scrolled') ? 'hidden' : 'visible'
          }
        }, 'keyboard_arrow_down')])]
      }
    })
  }

  redraw () {
    m.redraw()
  }
}

module.exports = MithrilUI
