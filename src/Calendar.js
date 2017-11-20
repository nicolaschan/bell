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
        } = this.special[Calendar.dateToString(date)] || this.week[Calendar.dayOfWeek(date)];
        var schedule = this.schedules[name];
        return schedule.overrideDisplay(display);
    }

    static dateToString(date) {
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    }
    static dayOfWeek(date) {
        var day = date.getDay();
        return {
            1: 'Mon',
            2: 'Tue',
            3: 'Wed',
            4: 'Thu',
            5: 'Fri',
            6: 'Sat',
            0: 'Sun'
        }[day];
    }
}

module.exports = Calendar;