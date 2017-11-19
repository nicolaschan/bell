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

    getCurrentPeriodIndex(time) {
        for (let i in this.periods) {
            let period = this.periods[i];
            if (period.time.hour > time.hour)
                return i - 1;
            if (period.time.hour >= time.hour && period.time.min > time.min)
                return i - 1;
        }
    }

    getCurrentPeriod(time) {
        try {
            return this.periods[this.getCurrentPeriodIndex(time)];
        } catch (e) {
            return null;
        }
    }
    getNextPeriod(time) {
        try {
            return this.periods[this.getCurrentPeriodIndex(time) + 1];
        } catch (e) {
            return null;
        }
    }
    getPreviousPeriod(time) {
        try {
            return this.periods[this.getCurrentPeriodIndex(time) - 1];
        } catch (e) {
            return null;
        }
    }
}

module.exports = Schedule;