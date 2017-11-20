const {
    lex,
    drop,
    dropEnd,
    trim,
    concat,
    remove
} = require('./Lexer');

const Schedule = require('./Schedule');
const Period = require('./Period');

var parseLine = function(line) {
    var [head, ...tokens] = drop(' ', lex(line));
    if (head == '*') {
        // it is a schedule header
        tokens = trim(' ', tokens);
        var [name, ...tokens] = tokens;
        tokens = trim(' ', tokens);
        var [separator, ...tokens] = tokens;
        tokens = trim(' ', tokens);
        var display = concat(tokens);
        return {
            name: name,
            display: display || name
        };
    } else {
        // it is a schedule entry
        var [hour, min] = head.split(':');
        var time = {
            hour: parseInt(hour),
            min: parseInt(min)
        };
        formatString = concat(trim(' ', tokens));
        return new Period(time, formatString);
    }
};
var parse = function(str) {
    str = remove('\r', str);
    var lines = str.split('\n').filter(line => line.length > 0);
    lines = lines.map(parseLine);
    var schedules = {};
    var currentSchedule;
    for (let line of lines)
        if (line instanceof Period) {
            schedules[currentSchedule].addPeriod(line);
        } else {
            var {
                name,
                display
            } = line;
            schedules[name] = new Schedule(name, display, []);
            currentSchedule = name;
        }
    return schedules;
};

module.exports = parse;