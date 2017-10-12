const $ = require('jquery');
const CookieManager = require('./CookieManager.js');
const Cookies = require('js-cookie');

var cookieManager = new CookieManager(Cookies);
global.cookieManager = cookieManager;

var generateSectionInputField = function() {
  var id = Date.now();
  var output = $('<div id="' + id + '" class="section"></div>');
  var select = $('<select></select>');
  var options = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(function(day) {
    return '<option value="' + day + '">' + day + '</option>';
  });
  select.append(options);
  var startTimeField = $('<input type="text" class="inputBox time-entry" placeholder="Start Time" maxlength="10"></input>');
  var endTimeField = $('<input type="text" class="inputBox time-entry" placeholder="End Time" maxlength="10"></input>');;
  output.append(select);
  output.append(startTimeField);
  output.append(endTimeField);
  var deleteButton = $('<a class="dismiss center-vertical delete-section" href="#"><i class="material-icons">cancel</i></a>');
  deleteButton.click(function() {
    $('#' + id).remove();
  });
  output.append(deleteButton);
  return output;
};

var removeNonNumbers = function(string) {
  var validChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':'];
  var out = '';
  for (var c of string) {
    if (validChars.indexOf(c) > -1)
      out += c;
  }
  return out;
};

var parseTime = function(timestring) {
  // "8am" -> [8,0]
  // "8:15" -> [8:15]
  // Returns a promise

  timestring = timestring.trim();
  var pm = timestring.toLowerCase().indexOf('p') > -1;
  var [hour, min] = removeNonNumbers(timestring).split(':');
  [hour, min] = [parseInt(hour), parseInt(min)];
  return [hour + (pm ? (hour < 12 ? 12 : 0) : 0), min || 0]
};

var readSection = function(sectionDom) {
  var day = $(sectionDom.children[0]).val();
  var start = parseTime($(sectionDom.children[1]).val());
  var end = parseTime($(sectionDom.children[2]).val());
  return [day, start, end];
};

var saveCourse = function() {
  var courseName = $('#course-name').val().trim();
  var sectionDoms = $('#enter-section').children();
  var sections = [];
  for (var i = 0; i < sectionDoms.length; i++) {
    sections.push(readSection(sectionDoms[i]));
  }

  var courses = cookieManager.getJSON('courses') || {};
  courses[courseName] = sections;
  cookieManager.set('courses', courses);
  window.location.href = '/classes';
};

$(function() {
  $('#add-section-button').click(function() {
    $('#enter-section').append(generateSectionInputField());
  });
  $('#done-button').click(function() {
    saveCourse();
  });
});