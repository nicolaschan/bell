const separators = ['*', ' ', '{', '}', '/'];

class ScheduleHeader {
    constructor(name, display) {
        this.name = name;
        this.display = display;
    }
}

class Literal {
    constructor(str) {
        this.str = str;
    }
}
class Symbol {
    constructor(name) {
        this.name = name;
    }
}
class Time {
    constructor(hour, min) {
        this.hour = hour;
        this.min = min;
    }
}

class FormatString {
    constructor(parts) {
        this.parts = parts;
    }
    format(bindings) {
        var output = '';
        for (let part of this.parts) {
            if (part instanceof Literal)
                output += part.str;
            if (part instanceof Symbol)
                output += bindings[part.name] || part.name;
        }
        return output;
    }
}

class ScheduleEntry {
    constructor(time, displayString) {
        this.time = time;
        this.displayString = displayString;
    }

    display(bindings) {
        return this.displayString.format(bindings);
    }
}

class Schedule {
    constructor(header, entries) {
        this.header = header;
        this.entries = entries;
    }
    addEntry(entry) {
        this.entries.push(entry);
    }
}

class ScheduleParser {
    static splitAndPreserve(str, chars) {
        var pieces = [''];
        for (let c of str) {
            if (chars.indexOf(c) > -1) {
                pieces.push(c);
                pieces.push('');
            } else {
                pieces[pieces.length - 1] += c;
            }
        }
        return pieces.filter(str => str.length > 0);
    }
    static lexLine(str) {
        return this.splitAndPreserve(str, separators);
    }
    static lex(str) {
        var lines = str.split('\n');
        return lines.map(line => this.lexLine(line));
    }
    static drop(char, arr) {
        while (arr[0] == char)
            arr = arr.slice(1);
        return arr;
    }
    static dropEnd(char, arr) {
        while (arr[arr.length - 1] == char)
            arr = arr.slice(0, -1);
        return arr;
    }
    static parseLine(line) {
        var [head, ...tokens] = this.drop(' ', this.lexLine(line));
        if (head == '*') {
            // it is a schedule header
            tokens = this.drop(' ', tokens);
            var [name, ...tokens] = tokens;
            var [slash, ...tokens] = this.drop(' ', tokens);
            tokens = this.drop(' ', tokens);

            if (slash == '/')
                return new ScheduleHeader(
                    name, this.dropEnd(' ', tokens.reduce((x, y) => x.concat(y)))
                );
            else
                return new ScheduleHeader(name, name);
        } else {
            // it is a schedule entry
            var [hour, min] = head.split(':');
            [hour, min] = [parseInt(hour), parseInt(min)];
            tokens = this.drop(' ', tokens);
            var pieces = [];

            var isSymbol = false;
            var buffer = [];
            for (let token of tokens) {
                if (token == '{') {
                    isSymbol = true;
                    pieces.push(new Literal(buffer.reduce((x, y) => x.concat(y), '')));
                    buffer = [];
                    continue;
                }
                if (token == '}') {
                    isSymbol = false;
                    pieces.push(new Symbol(buffer.reduce((x, y) => x.concat(y), '')));
                    buffer = [];
                    continue;
                }
                buffer.push(token);
            }
            buffer = this.dropEnd(' ', buffer);
            pieces.push(new Literal(buffer.reduce((x, y) => x.concat(y), '')));
            return new ScheduleEntry(new Time(hour, min), new FormatString(pieces));
        }
    }
    static parse(str) {
        var lines = str.split('\n').filter(line => line.length > 0);
        lines = lines.map(line => this.parseLine(line));
        var schedules = {};
        var currentSchedule;
        for (let line of lines)
            if (line instanceof ScheduleHeader) {
                currentSchedule = line.name;
                schedules[line.name] = new Schedule(line, []);
            } else {
                schedules[currentSchedule].addEntry(line);
            }
        return schedules;
    }
}

module.exports = ScheduleParser;