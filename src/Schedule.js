const Period = require('./Period');

class Schedule {
    constructor(name, display, periods) {
        this.name = name;
        this.display = display;
        this.periods = periods;
    }

    overrideDisplay(display) {
        if (!display)
            return this;
        return new Schedule(this.name, display, this.periods);
    }

    addPeriod(period) {
        this.periods.push(period);
    }

    getCurrentPeriodIndex(date) {
        var time = {
            hour: date.getHours(),
            min: date.getMinutes()
        };

        for (let i in this.periods) {
            let period = this.periods[i];
            if (period.time.hour > time.hour)
                return i - 1;
            if (period.time.hour >= time.hour && period.time.min > time.min)
                return i - 1;
        }
        return this.periods.length - 1;
    }

    getPeriodByIndex(i, date) {
        var period = this.periods[i];
        if (period)
            return period.addTimestamp(date);
    }

    getCurrentPeriod(date) {
        var period = this.getPeriodByIndex(this.getCurrentPeriodIndex(date), date);
        if (!period)
            return new Period({
                hour: 0,
                min: 0
            }, 'None').addTimestamp(date);
        return period;
    }
    getNextPeriod(date) {
        return this.getPeriodByIndex(this.getCurrentPeriodIndex(date) + 1, date);
    }
    getPreviousPeriod(date) {
        return this.getPeriodByIndex(this.getCurrentPeriodIndex(date) - 1, date);
    }
}

module.exports = Schedule;