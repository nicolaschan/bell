const $ = require('jquery');
const CookieManager = require('./CookieManager.js');
const Cookies = require('js-cookie');

var cookieManager = new CookieManager(Cookies);
global.cookieManager = cookieManager;

var padNumber = function(number, padding) {
  var string = number.toString();
  while (string.length < padding)
    string = '0' + string;
  return string;
};

var displayTimeArray = function(time) {
  var [hour, min] = time;
  var part = (hour >= 12) ? 'pm' : 'am';

  hour = (hour > 12) ? hour - 12 : hour;
  min = min ? ':' + padNumber(min, 2) : '';

  return hour + min + part;
};

var generateCourseElement = function(name, sections) {
  var element = $('<li></li>').append($(`<a class="course-link" href="/enter?class=${name}"></a>`).text(name));
  var tableBody = $('<tbody></tbody>');
  var table = $('<table class="sections"></table>').append(tableBody);
  for (var section in sections) {
    var row = $('<tr></tr>');
    row.append($('<td class="day"></td>').text(sections[section][0]));
    row.append($('<td></td>').text(displayTimeArray(sections[section][1]) + ' - ' + displayTimeArray(sections[section][2])));
    tableBody.append(row);
  }
  var deleteLink = $('<a class="delete-link" href="#"></a>').text('Delete');
  deleteLink.click(function(e) {
    var courses = cookieManager.getJSON('courses');
    delete courses[name];
    cookieManager.set('courses', courses);
    reloadCourses();
  });
  tableBody.append($('<tr></tr>').append(deleteLink));
  element.append(table);
  return element;
};

var reloadCourses = function() {
  var courses = cookieManager.getJSON('courses');
  $('#class-list').empty();
  for (var name in courses) {
    $('#class-list').append(generateCourseElement(name, courses[name]));
  }
};

$(function() {
  reloadCourses();
});