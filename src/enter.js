const $ = require('jquery')
const queryString = require('query-string')
const shortid = require('shortid')
const CookieManager = require('./CookieManager3.js')

const cookieManager = new CookieManager()

var courseId

var getDayOptions = function () {
  return cookieManager.get('dayopts') || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
}

var options = getDayOptions().map((opt) => '<option value="' + opt + '">' + opt + '</option>')

/*
after entering a section on the sections website, clicking add another section generates the new section with the same default time
do validation
change colors when users hover and stuff
*/

var generateSectionInputField = function (day, start, end) {
  var id = Date.now()
  var output = $('<div id="' + id + '" class="section"></div>')
  var select = $('<select></select>')
  select.append(options)
  select.val(day)
  var startTimeField = $('<input type="text" class="inputBox time-entry" placeholder="Start Time" maxlength="10"></input>')
  var endTimeField = $('<input type="text" class="inputBox time-entry" placeholder="End Time" maxlength="10"></input>')
  startTimeField.val(start)
  endTimeField.val(end)
  output.append(select)
  output.append(startTimeField)
  output.append(endTimeField)
  var deleteButton = $('<a class="dismiss center-vertical delete-section" href="#"><i class="material-icons">cancel</i></a>')
  deleteButton.click(function () {
    $('#' + id).remove()
  })
  output.append(deleteButton)
  return output
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
// like the old parsing function, but with more validation
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

var readSection = function (sectionDom) {
  var day = $(sectionDom.children[0]).val()
  var start = parseTime($(sectionDom.children[1]).val())
  var end = parseTime($(sectionDom.children[2]).val())
  return [day, start, end]
}

var saveCourse = function () {
  var courseName = $('#course-name').val().trim()

  if (!courseName) {
    window.location.href = '/classes'
    return
  }

  var sectionDoms = $('#enter-section').children()
  var sections = []
  for (var s of sectionDoms) {
    sections.push(readSection(s))
  }

  var courses = cookieManager.get('courses') || {}
  courses[courseId] = {
    name: courseName,
    sections: sections
  }
  cookieManager.set('courses', courses).then(() => {
    window.location.href = '/classes'
  })
}

var padNumber = function (number, padding) {
  var string = number.toString()
  while (string.length < padding) { string = '0' + string }
  return string
}

var displayTimeArray = function (time) {
  if (time.length < 2) { return '' }

  var [hour, min] = time
  var part = (hour >= 12) ? 'pm' : 'am'

  hour = (hour > 12) ? hour - 12 : hour
  min = min ? ':' + padNumber(min, 2) : ''

  return hour + min + part
}

var setFormState = function (courseId) {
  var course = cookieManager.get('courses', {})[courseId] || {
    name: '',
    sections: [
      ['Monday', [],
                []
      ]
    ]
  }

  $('#course-name').val(course.name)
  for (var section of course.sections) {
    $('#enter-section').append(
            generateSectionInputField(section[0], displayTimeArray(section[1]), displayTimeArray(section[2])))
  }
}

$(function () {
  cookieManager.initialize().then(function () {
    $('#add-section-button').click(function () {
      $('#enter-section').append(generateSectionInputField('Monday', '', ''))
    })
    $('#done-button').click(function () {
      saveCourse()
    })

    courseId = queryString.parse(window.location.search)['course'] || shortid.generate()
    setFormState(courseId)
  })
})
