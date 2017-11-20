const _ = require('lodash');
const $ = require('jquery');
const async = require('async');

const Period = require('./Period');

var timeArrayToDate = function(date, timeArray, resetMilliseconds) {
    var date = new Date(date.getTime());
    date.setHours(timeArray[0]);
    date.setMinutes(timeArray[1]);
    date.setSeconds(0);
    if (resetMilliseconds)
        date.setMilliseconds(0);
    return date;
};
var dateToString = function(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
};

class BellTimer {
    constructor(cookieManager, requestManager) {
        this.cookieManager = cookieManager;
        this.requestManager = requestManager;

        this.debug = function() {};
        this.devMode = false;
        this.startTime = 0;
        this.timeScale = 1;

        var devModeCookie = this.cookieManager.get('dev_mode');
        if (devModeCookie) {
            this.enableDevMode(devModeCookie.startDate, devModeCookie.scale);
        }
    }

    setDebugLogFunction(logger) {
        this.debug = logger;
    }

    setSchedulesAndCalendar(schedules, calendar) {
        var empty = true;
        for (var day of calendar.defaultWeek) {
            for (var period in schedules[day].periods) {
                if (period.toLowerCase() != 'free') {
                    empty = false;
                    break;
                }
            }
            if (!empty)
                break;
        }

        if (empty) {
            this.schedules = {
                None: {
                    displayName: 'No schedules',
                    periods: [{
                        name: 'None',
                        time: [6, 0]
                    }]
                }
            };
            this.calendar = {
                defaultWeek: ['None', 'None', 'None', 'None', 'None', 'None', 'None'],
                specialDays: {}
            };
            this.empty = true;
        } else {
            this.schedules = schedules;
            this.calendar = calendar;
        }
    }

    loadCustomCourses() {
        var courses = this.cookieManager.get('courses');

        var calendar = {
            defaultWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            specialDays: {}
        };

        var schedules = {};

        for (var i in calendar.defaultWeek) {
            schedules[calendar.defaultWeek[i]] = {
                displayName: calendar.defaultWeek[i],
                periods: []
            };
        }

        for (var id in courses) {
            var course = courses[id];
            var name = course.name;
            var sections = course.sections;
            for (var section of sections) {
                if (!schedules[section[0]])
                    schedules[section[0]] = {
                        displayName: section[0],
                        periods: []
                    };
                schedules[section[0]].periods.push({
                    name: name,
                    time: section[1]
                });
                schedules[section[0]].periods.push({
                    name: 'Free',
                    time: section[2]
                });
                schedules[section[0]].periods
                    .sort((a, b) => {
                        var startDifference = (a.time[0] * 60 + a.time[1]) - (b.time[0] * 60 + b.time[1]);
                        return startDifference;
                    });
            }
        }

        this.setCorrection(0);
        this.setSchedulesAndCalendar(schedules, calendar);
    }

    async reloadData() {
        var dataSource = this.cookieManager.get('source', 'lahs');
        if (dataSource == 'custom')
            return this.loadCustomCourses();

        var version = await this.requestManager.get('/api/version');
        if (this.version && this.version != version)
            $(window)[0].location.reload();
        else
            this.version = version;

        var correction = await this.requestManager.get(`/api/data/${dataSource}/correction`, '0');
        this.setCorrection(parseInt(correction));

        var parseSchedules = require('./ScheduleParser');
        var parseCalendar = require('./CalendarParser');

        var schedules = await this.requestManager.get(`/api/data/${dataSource}/schedules`);
        schedules = parseSchedules(schedules);

        var calendar = await this.requestManager.get(`/api/data/${dataSource}/calendar`);
        calendar = parseCalendar(calendar, schedules);

        return this.calendar = calendar;
    }

    async initialize() {
        var loaded = await this.reloadData();
        var ts = await this.initializeTimesync();
        return;
    }

    async initializeTimesync() {
        if (typeof timesync == 'undefined') {
            this.ts = Date;
            console.warn('Timesync not found');
            return this.ts;
        }

        var ts = timesync.create({
            server: this.requestManager.host + '/timesync',
            interval: 4 * 60 * 1000
        });

        ts.on('change', offset =>
            this.debug('Timesync offset: ' + offset));

        this.ts = ts;

        return new Promise((resolve, reject) =>
            ts.on('sync', _.once(() => resolve(ts))));
    }

    setCorrection(correction) {
        this.correction = correction;
    }

    getCorrection() {
        return this.correction;
    }

    enableDevMode(startDate, scale) {
        console.warn('You are in Developer Mode! Disable with `bellTimer.disableDevMode()`')

        this.devMode = true;
        this.startTime = new Date(startDate).getTime();
        this.devModeStartTime = Date.now();
        this.timeScale = scale;

        this.cookieManager.set('dev_mode', {
            enabled: this.devMode,
            startDate: startDate,
            scale: scale
        });
    }

    disableDevMode() {
        this.devMode = false;
        this.cookieManager.remove('dev_mode');
    }

    getDate() {
        if (this.devMode)
            return new Date((this.startTime + ((Date.now() - this.devModeStartTime) * this.timeScale) + this.correction));
        if (this.ts)
            return new Date(this.ts.now() + this.correction);
        return new Date(Date.now() + this.correction);
    }

    getTimeRemainingNumber() {
        var date = this.getDate();
        if (!this.getNextPeriod().timestamp.getTime)
            console.log(this.getNextPeriod());
        return this.getNextPeriod().timestamp.getTime() - (Math.floor(date.getTime() / 1000) * 1000);
    }

    getTimeRemainingString() {
        var date = this.getDate();
        var displayTimeNumber = function(time) {
            var hours = Math.floor(time / 1000 / 60 / 60);
            var seconds = Math.floor(time / 1000 % 60).toString();
            if (seconds.length < 2)
                seconds = '0' + seconds;
            var minutes = Math.floor(time / 1000 / 60 % 60).toString();
            if (minutes.length < 2 && hours)
                minutes = '0' + minutes;
            return (hours < 1) ? minutes + ':' + seconds : hours + ':' + minutes + ':' + seconds;
        };
        return displayTimeNumber(this.getTimeRemainingNumber());
    }

    getWaitUntilNextTick() {
        return this.getDate().getMilliseconds();
    }

    getProportionElapsed() {
        var date = this.getDate();

        var currentPeriodStart = this.getCurrentPeriod().timestamp.getTime();
        var nextPeriodStart = this.getNextPeriod().timestamp.getTime();

        var totalTime = nextPeriodStart - currentPeriodStart;
        var elapsedTime = date.getTime() - currentPeriodStart;

        return elapsedTime / totalTime;
    }

    getNextPeriod() {
        var date = this.getDate();
        var period = this.calendar.getSchedule(date).getNextPeriod(date);
        while (!period) {
            var date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
            period = this.calendar.getSchedule(date).getCurrentPeriod(date);
        }
        return period;

        return this.getPeriodByNumber(date, this.getCurrentPeriodNumber(date) + 1);
    }

    getCurrentPeriod() {
        var date = this.getDate();
        return this.calendar.getSchedule(date).getCurrentPeriod(date) || new Period({
            hour: 0,
            min: 0
        }, 'None').addTimestamp(date);
    }

    getPeriodByNumber(date, i) {
        var currentPeriods = this.getCurrentSchedule(date).periods;
        if (i == -1) {
            return {
                name: 'None',
                time: this.getPreviousPeriod().time,
                timestamp: this.getPreviousPeriod().timestamp
            };
        }
        if (i == currentPeriods.length) {
            var newDate = new Date(date.getTime());
            newDate.setSeconds(0);
            newDate.setMinutes(0);
            newDate.setHours(0);
            newDate.setDate(newDate.getDate() + 1);
            var period = _.cloneDeep(this.getPeriodByNumber(newDate, 0));

            return period;
        }
        return currentPeriods[i];
    }

    getCurrentPeriodNumber() {
        var date = this.getDate();
        return this.calendar.getSchedule(date).getCurrentPeriodIndex(date);
    }

    getCompletedPeriods() {
        var completedPeriods = [];
        var schedule = this.getCurrentSchedule();
        var periods = schedule.periods;
        for (var i = 0; i < this.getCurrentPeriodNumber(); i++) {
            completedPeriods.push(periods[i]);
        }
        return completedPeriods;
    }

    getFuturePeriods() {
        var futurePeriods = [];
        var schedule = this.getCurrentSchedule();
        var periods = schedule.periods;
        for (var i = this.getCurrentPeriodNumber() + 1; i < periods.length; i++) {
            futurePeriods.push(periods[i]);
        }
        return futurePeriods;
    }

    getPreviousPeriod(date) {
        var completedPeriods = this.getCompletedPeriods();
        if (this.getCompletedPeriods().length > 0)
            return _.last(this.getCompletedPeriods());

        if (!date) date = this.getDate();
        var date = new Date(date.getTime());
        date.setDate(date.getDate() - 1);

        var schedule = this.getCurrentSchedule(date);
        if (schedule.periods.length > 0)
            return _.last(schedule.periods);
        else
            return this.getPreviousPeriod(date);
    }

    getCurrentSchedule(date) {
        if (!date) date = this.getDate();
        return this.calendar.getSchedule(date);
    }
}

module.exports = BellTimer;