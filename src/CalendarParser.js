const {
    lex,
    drop,
    dropEnd
} = require('./Lexer');
const Calendar = require('./Calendar');

var parse = function(str, schedules) {
    var lines = str.split('\n');
    lines = lines.map(line => drop(' ', lex(line)));

    var week = {};
    var special = {};

    var section;
    for (let line of lines) {
        var [head, ...tail] = line;
        tail = dropEnd(' ', drop(' ', tail));

        if (head == '*') {
            tail = tail.reduce((a, b) => a.concat(b));
            section = tail;
            continue;
        }

        if (section == 'Default Week') {
            var [day, name, hash, display] = tail;
            week[day] = {
                name: name,
                display: display
            };
        } else if (section == 'Special Days') {
            var [date, name, hash, display] = tail;
            special[date] = {
                name: name,
                display: display
            };
        }
    }

    return new Calendar(week, special, schedules);
};

module.exports = parse;