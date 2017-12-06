const $ = require('jquery');
const CookieManager = require('./CookieManager3.js');

const cookieManager = new CookieManager();

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

var generateCourseElement = function(id, course) {
    var name = course.name;
    var sections = course.sections;

    var element = $('<li></li>').append($(`<a class="course-link" href="/enter?course=${id}"></a>`).text(name));
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
        var courses = cookieManager.get('courses');
        delete courses[id];
        cookieManager.set('courses', courses);
        reloadCourses();
    });
    tableBody.append($('<tr></tr>').append(deleteLink));
    element.append(table);
    return element;
};

var reloadCourses = function() {
    var courses = cookieManager.get('courses');
    $('#class-list').empty();
    for (var id in courses) {
        $('#class-list').append(generateCourseElement(id, courses[id]));
    }
};

$(function() {
    cookieManager.initialize().then(reloadCourses);
});