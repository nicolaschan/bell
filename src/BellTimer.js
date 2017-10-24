const _ = require('lodash');
const $ = require('jquery');
const async = require('async');

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

    setBellCompensation(bellCompensation) {
        this.bellCompensation = 0;
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

        this.setBellCompensation(0);
        this.setSchedulesAndCalendar(schedules, calendar);
    }

    async reloadData() {
        var dataSource = this.cookieManager.get('source', 'lahs');
        if (dataSource == 'custom')
            return this.loadCustomCourses();

        var parseData = data => {
            var rawSchedules = data.schedules;

            for (var key in rawSchedules) {
                var schedule = rawSchedules[key];
                for (var i = 0; i < schedule.periods.length; i++) {
                    var period = schedule.periods[i];
                    var nameSplit = period.name.split('{').map(function(a) {
                        return a.split('}');
                    }).reduce(function(a, b) {
                        return a.concat(b);
                    });
                    for (var j = 1; j < nameSplit.length; j += 2) {
                        var selectedName = this.cookieManager.get('periods', {})[nameSplit[j]];
                        nameSplit[j] = selectedName || nameSplit[j];
                    }
                    var name = nameSplit.reduce(function(a, b) {
                        return a.concat(b);
                    });
                    period.name = name;
                    if (name == 'Passing to Free') {
                        period.name = 'Free';
                    } else if (name == 'Free') {
                        schedule.periods.splice(i, 1);
                        i--;
                    }
                    if (i == 0 && name == 'Free') {
                        schedule.periods.splice(i, 1);
                        i--;
                    }
                }
            }

            this.setSchedulesAndCalendar(rawSchedules, data.calendar);
        };
        var parseSchedules = function(text) {
            var outputSchedules = {};

            var lines = text.split('\n').map(s => s.replace('\r', ''));

            var currentScheduleName;
            var currentSchedule;
            for (var i in lines) {
                var line = lines[i];
                if (line[0] == '*') {
                    if (currentSchedule)
                        outputSchedules[currentScheduleName] = currentSchedule;
                    currentScheduleName = line.substring(2).split(' (')[0];
                    currentSchedule = {
                        displayName: line.split('(')[1].substring(0, line.split('(')[1].indexOf(')')),
                        periods: []
                    };
                    if (line.indexOf('[') > -1)
                        currentSchedule.color = line.split('[')[1].substring(0, line.split('[')[1].indexOf(']'));
                } else {
                    if (!line)
                        continue;
                    var time = line.substring(0, line.indexOf(' '));
                    var hour = time.split(':')[0];
                    var minute = time.split(':')[1];
                    var periodName = line.substring(line.indexOf(' ') + 1);

                    currentSchedule.periods.push({
                        name: periodName,
                        time: [parseInt(hour), parseInt(minute)]
                    });
                }
            }

            if (currentSchedule) {
                outputSchedules[currentScheduleName] = currentSchedule;
            }

            return outputSchedules;
        };
        var parseCalendar = function(text, schedules) {
            var calendar = {
                defaultWeek: [], // 0 is Sunday, 1 is Monday, etc.
                specialDays: {}
            };

            var lines = text.split('\n').map(s => s.replace('\r', ''));

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                if (line == '* Default Week') {
                    line = lines[++i];
                    while (line && line[0] != '*') {
                        calendar.defaultWeek.push(line.substring(2));
                        line = lines[++i];
                    }
                }
                if (line == '* Special Days') {
                    line = lines[++i];

                    while (line && line[0] != '*') {
                        if (line.split(' ')[0].indexOf('-') > -1) {
                            // is a range
                            var date = new Date(line.split(' ')[0].split('-')[0]);
                            var endDate = new Date(line.split(' ')[0].split('-')[1]);
                            var scheduleName = line.split(' ')[1];
                            var schedule = {
                                scheduleName: scheduleName,
                                customName: (line.indexOf('(') > -1) ? line.split('(')[1].substring(0, line.split('(')[1].indexOf(')')) : schedules[scheduleName].displayName
                            };
                            while (dateToString(date) != dateToString(endDate)) {
                                calendar.specialDays[dateToString(date)] = schedule;
                                date.setDate(date.getDate() + 1);
                            }
                            calendar.specialDays[dateToString(endDate)] = schedule;
                        } else {
                            // is not a range
                            var date = new Date(line.split(' ')[0]);
                            var scheduleName = line.split(' ')[1];
                            calendar.specialDays[dateToString(date)] = {
                                scheduleName: scheduleName,
                                customName: (line.indexOf('(') > -1) ? line.split('(')[1].substring(0, line.split('(')[1].indexOf(')')) : schedules[scheduleName].displayName
                            };
                        }
                        line = lines[++i];
                    }
                }
            }

            return calendar;
        };

        var version = await this.requestManager.get('/api/version');
        if (this.version && this.version != version)
            $(window)[0].location.reload();
        else
            this.version = version;

        var correction = await this.requestManager.get(`/api/data/${dataSource}/correction`, '0');
        this.setBellCompensation(parseInt(correction));

        var schedules = await this.requestManager.get(`/api/data/${dataSource}/schedules`);
        schedules = parseSchedules(schedules);

        var calendar = await this.requestManager.get(`/api/data/${dataSource}/calendar`);
        calendar = parseCalendar(calendar, schedules);

        return parseData({
            schedules: schedules,
            calendar: calendar
        });
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
        this.bellCompensation = correction;
    }

    getCorrection() {
        return this.bellCompensation;
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
            return new Date(this.startTime + ((Date.now() - this.devModeStartTime) * this.timeScale));
        if (this.ts)
            return new Date(this.ts.now() + this.bellCompensation);
        return new Date(Date.now() + this.bellCompensation);
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
        return this.getPeriodByNumber(date, this.getCurrentPeriodNumber(date) + 1);
    }

    getCurrentPeriod() {
        var date = this.getDate();
        return this.getPeriodByNumber(date, this.getCurrentPeriodNumber(date));
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
        var schedule = this.getCurrentSchedule(date);
        var periods = schedule.periods;
        for (var i = 0; i < periods.length; i++) {
            if (periods[i].time[0] > date.getHours())
                return i - 1;
            if (periods[i].time[0] == date.getHours())
                if (periods[i].time[1] > date.getMinutes())
                    return i - 1;
        }
        return i - 1;
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
        var dateString = dateToString(date);
        var specialDay = this.calendar.specialDays[dateString];

        var schedule;
        if (specialDay) {
            schedule = this.schedules[specialDay.scheduleName];
            schedule.displayName = specialDay.customName;
        } else {
            schedule = this.schedules[this.calendar.defaultWeek[date.getDay()]];
        }

        for (var i in schedule.periods) {
            var timestamp = timeArrayToDate(date, schedule.periods[i].time, true);
            schedule.periods[i].timestamp = timestamp;
        }

        return schedule;
    }
}

module.exports = BellTimer;