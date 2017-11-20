const format = require('./FormatString');

class Period {
    constructor(time, formatString) {
        this.time = time;
        this.formatString = formatString;
    }

    display(bindings = {}) {
        return format(this.formatString, bindings);
    }

    addTimestamp(date) {
        var period = new Period(this.time, this.formatString);
        period.timestamp = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            this.time.hour,
            this.time.min,
            0, 0);
        return period;
    }
}

module.exports = Period;