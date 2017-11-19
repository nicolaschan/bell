class Calendar {
    constructor(week, special, schedules) {
        this.week = week;
        this.special = special;
        this.schedules = schedules;
    }

    getSchedule(date) {
        var {
            name,
            display
        } = this.special[date] || this.week[new Date(date).getDay()];
        var schedule = this.schedules[name];
        return schedule.overrideDisplay(display);
    }
}

module.exports = Calendar;