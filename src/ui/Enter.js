const m = require('mithril')

const querystring = require('querystring')
const shortid = require('shortid')

var padNumber = function (number, padding) {
  var string = number.toString()
  while (string.length < padding) { string = '0' + string }
  return string
}

var displayTimeArray = function (time) {
  var [hour, min] = time
  var part = (hour >= 12) ? 'pm' : 'am'

  hour = (hour > 12) ? hour - 12 : hour
  min = min ? ':' + padNumber(min, 2) : ''

  return hour + min + part
}

var Model = {
  data: {},
  setCourseName: name => {
    Model.data.name = name
  },
  save: (id, cookieManager) => {
    if (!id) {
      id = shortid.generate()
    }
    Model.data.sections = []

    const withWeekdays = []
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    for (let section of Sections.data) {
      if (!section) { continue }
      if (section[0] === 'Weekdays') {
        for (let day of weekdays) {
          withWeekdays.push([day, section[1], section[2]])
        }
      } else {
        withWeekdays.push(section)
      }
    }

    for (let section of withWeekdays) {
      try {
        Model.data.sections.push([
          section[0], parseTime(section[1]), parseTime(section[2])])
      } catch (e) {
        console.log(e)
        // Skip this section because invalid time
      }
    }
    var classes = cookieManager.get('courses', {})
    classes[id] = Model.data
    cookieManager.set('courses', classes)
  }
}

var Sections = {
  data: [],
  addNewSection: function () {
    Sections.data.push(['Monday', '', ''])
  }
}

var removeNonNumbers = function (string) {
  var validChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':']
  var out = ''
  for (var c of string) {
    if (validChars.indexOf(c) > -1) { out += c }
  }
  return out
}

var checkTime = function (time) { // time is an int array :)
  var hour = time[0]
  var min = time[1]
  return hour <= 24 && hour >= 0 && min >= 0 && min <= 60
}
var getTime = function (time) { // time is a string array
  if (time.length !== 1 && time.length !== 2) { throw new Error('Failed to parse time ' + time) }
  var x
  if (time.length === 1) { x = [parseInt(time[0]), 0] } else { x = [parseInt(time[0]), parseInt(time[1])] }
  if (checkTime(x)) { return x } else { throw new Error('Time ' + x + ' is out of range.') }
}

var parseTime = function (timestring) {
  /**
     * 1) user enters either a single number (hour) or hour:min
     * 2) user enters either 24hr or am/pm
     */
  timestring = timestring.trim()
  // check if AM/PM is specified
  var tokens = timestring.split(/\s/)

  var word = (arr, x) => arr.toUpperCase().indexOf(x) > -1
  switch (tokens.length) {
    case 1: // TODO interpret either as 24hr or as most likely 12hr input
    case 2: // someone told AM/PM (or o'clock)
      var pm = false
      var i = tokens.length - 1
      if (word(tokens[i], 'AM'));
      else if (word(tokens[i], 'PM')) { pm = true } else if (word(tokens[i], 'O\'CLOCK'));
      else if (tokens.length === 2) { throw new Error('Failed to parse time ' + tokens) }
      tokens[0] = removeNonNumbers(tokens[0])
      var [hour, min] = getTime(tokens[0].split(':'))
      return [hour + (pm ? (hour < 12 ? 12 : 0) : 0), min]
    case 0:
    default:
      throw new Error('Bad timestring, tokenized as ' + tokens)
  }
}

const Enter = {
  oninit: function (vnode) {
    var query = querystring.parse(window.location.search.substring(1))
    var id = query.course
    vnode.state.id = id
    Model.data = vnode.attrs.cookieManager.get('courses', {})[id] || {
      name: '',
      sections: [
        ['Monday', null, null]
      ]
    }
    Sections.data = []
    for (let section of Model.data.sections) {
      var day = section[0]
      var start = (section[1]) ? displayTimeArray(section[1]) : ''
      var end = (section[2]) ? displayTimeArray(section[2]) : ''
      Sections.data.push([day, start, end])
    }
  },
  view: function (vnode) {
    return [
      m('.header', m('h1', 'Enter Class')),
      m('.course-input', [
        'Class Name',
        m('input.inputBox.course-name#course-name[type=text][placeholder=Class Name][maxlength=30]', {
          autofocus: true,
          oninput: m.withAttr('value', Model.setCourseName),
          value: Model.data.name
        }),
        m('#enter-section', Sections.data.map((section, i) => m('.section', [
          m('select', {
            value: section[0],
            oninput: m.withAttr('value', value => {
              section[0] = value
            })
          }, [
            m('option[value=Monday]', 'Monday'),
            m('option[value=Tuesday]', 'Tuesday'),
            m('option[value=Wednesday]', 'Wednesday'),
            m('option[value=Thursday]', 'Thursday'),
            m('option[value=Friday]', 'Friday'),
            m('option[value=Saturday]', 'Saturday'),
            m('option[value=Sunday]', 'Sunday'),
            m('option[value=Weekdays]', 'Weekdays')
          ]),
          m('input.inputBox.time-entry[placeholder=Start Time][maxlength=10][type=text]', {
            value: section[1],
            oninput: m.withAttr('value', value => {
              section[1] = value
            })
          }),
          m('input.inputBox.time-entry[placeholder=End Time][maxlength=10][type=text]', {
            value: section[2],
            oninput: m.withAttr('value', value => {
              section[2] = value
            })
          }),
          m('a.dismiss-enter.center-vertical.delete-section[href=javascript:void(0);]', {
            onclick: () => delete Sections.data[i]
          }, m('i.material-icons', 'cancel'))
        ])))
      ]),
      m('.add-link', m('a.add#add-section-button[href=javascript:void(0);]', {
        onclick: Sections.addNewSection
      }, '+ Add Section')),
      m('.footer-right[style=position: fixed;]', m('a[href=javascript:void(0);]', {
        onclick: () => {
          Model.save(vnode.state.id, vnode.attrs.cookieManager)
          m.route.set('/classes')
        }
      }, m('i.done-icon.icon.material-icons', 'done')))
    ]
  }
}

module.exports = Enter
