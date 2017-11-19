const format = require('./FormatString');

class Period {
    constructor(time, formatString) {
        this.time = time;
        this.formatString = formatString;
    }

    display(bindings = {}) {
        return format(this.formatString, bindings);
    }
}

module.exports = Period;