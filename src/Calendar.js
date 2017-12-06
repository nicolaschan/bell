class Calendar {
    constructor(week, special, schedules) {
        this.week = week;
        this.special = special;
        for (var day in special) {
            if (day.indexOf('-') > -1) {
                var range = day;
                var schedule = special[day];
                var [start, end] = range.split('-');
                delete special[day];
                var current = new Date(start);
                while (Calendar.dateToString(current) != end) {
                    this.special[Calendar.dateToString(current)] = schedule;
                    current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
                }
                this.special[Calendar.dateToString(current)] = schedule;
            }
        }
        this.schedules = schedules;
    }

    getSchedule(date) {
        var {
            name,
            display
        } = this.special[Calendar.dateToString(date)] || this.week[Calendar.dayOfWeek(date)];
        var schedule = this.schedules[name];
        schedule = schedule.overrideDisplay(display);
        return schedule;
    }

    static padZeros(num, len) {
        num = num + '';
        while (num.length < len)
            num = '0' + num;
        return num;
    }
    static dateToString(date) {
        return `${Calendar.padZeros(date.getMonth() + 1, 2)}/${Calendar.padZeros(date.getDate(), 2)}/${date.getFullYear()}`;
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