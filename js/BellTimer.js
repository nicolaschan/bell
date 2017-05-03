const _ = require('lodash');
const $ = require('jquery');
const async = require('async');

var self;

(function() {
  var BellTimer = function(classesManager) {
    self = this;

    this.classesManager = classesManager;

    this.debug = function() {};
    this.devMode = false;
    this.startTime = 0;
    this.timeScale = 1;
  };

  var timeArrayToDate = function(date, timeArray, resetMilliseconds) {
    var date = new Date(date.getTime());
    date.setHours(timeArray[0]);
    date.setMinutes(timeArray[1]);
    date.setSeconds(0);
    if (resetMilliseconds)
      date.setMilliseconds(0);
    return date;
  };

  BellTimer.prototype.setDebugLogFunction = function(logger) {
    this.debug = logger;
  };
  BellTimer.prototype.reloadData = function(callback) {
    $.ajax({
      url: '/api/data?v=' + Date.now(),
      type: 'GET'
    }).done(function(data) {
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
            nameSplit[j] = self.classesManager.getClasses()[parseInt(nameSplit[j])];
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

      self.schedules = rawSchedules;
      self.calendar = data.calendar;
      self.bellCompensation = data.correction;

      if (self.version && self.version != data.version)
        $(window)[0].location.reload();
      else
        self.version = data.version;

      if (callback)
        callback();
    });
  };
  BellTimer.prototype.initialize = function(callback) {

    async.series([
      self.reloadData,
      _.partial(self.initializeTimesync)
      //_.partial(self.synchronize, n)
    ], callback);
  };
  BellTimer.prototype.initializeTimesync = function(callback) {
    var callback = _.once(callback);

    if (typeof timesync == 'undefined') {
      self.ts = Date;
      callback();
    }

    var ts = timesync.create({
      server: '/timesync',
      interval: 4 * 60 * 1000
    });

    ts.on('change', function(offset) {
      self.debug('Timesync offset: ' + offset);
    });

    ts.on('sync', _.once(function() {
      callback();
    }));

    self.ts = ts;
  };
  BellTimer.prototype.setCorrection = function(correction) {
    this.bellCompensation = correction;
  };
  BellTimer.prototype.getCorrection = function() {
    return this.bellCompensation;
  };
  BellTimer.prototype.enableDevMode = function(startDate, scale) {
    this.devMode = true;
    this.startTime = startDate.getTime();
    this.devModeStartTime = Date.now();
    this.timeScale = scale;
  }
  BellTimer.prototype.getDate = function() {
    return new Date(this.ts.now() + this.bellCompensation);

    // if (this.devMode)
    //   return new Date(this.startTime + ((Date.now() - this.devModeStartTime) * this.timeScale));
    // return new Date(Date.now() + this.bellCompensation + this.synchronizationCorrection);
  };
  BellTimer.prototype.getTimeRemainingNumber = function() {
    var date = this.getDate();
    if (!this.getNextPeriod().timestamp.getTime)
      console.log(this.getNextPeriod());
    return this.getNextPeriod().timestamp.getTime() - (Math.floor(date.getTime() / 1000) * 1000);
  };
  BellTimer.prototype.getTimeRemainingString = function() {
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
  };
  BellTimer.prototype.getWaitUntilNextTick = function() {
    return this.getDate().getMilliseconds();
  };
  BellTimer.prototype.getProportionElapsed = function() {
    var date = this.getDate();

    var currentPeriodStart = this.getCurrentPeriod().timestamp.getTime();
    var nextPeriodStart = this.getNextPeriod().timestamp.getTime();

    var totalTime = nextPeriodStart - currentPeriodStart;
    var elapsedTime = date.getTime() - currentPeriodStart;

    return elapsedTime / totalTime;
  };
  BellTimer.prototype.getNextPeriod = function() {
    var date = this.getDate();
    return this.getPeriodByNumber(date, this.getCurrentPeriodNumber(date) + 1);
  };
  BellTimer.prototype.getCurrentPeriod = function() {
    var date = this.getDate();
    return this.getPeriodByNumber(date, this.getCurrentPeriodNumber(date));
  };
  BellTimer.prototype.getPeriodByNumber = function(date, i) {
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
  };
  BellTimer.prototype.getCurrentPeriodNumber = function() {
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
  };
  BellTimer.prototype.getCompletedPeriods = function() {
    var completedPeriods = [];
    var schedule = this.getCurrentSchedule();
    var periods = schedule.periods;
    for (var i = 0; i < this.getCurrentPeriodNumber(); i++) {
      completedPeriods.push(periods[i]);
    }
    return completedPeriods;
  };
  BellTimer.prototype.getFuturePeriods = function() {
    var futurePeriods = [];
    var schedule = this.getCurrentSchedule();
    var periods = schedule.periods;
    for (var i = this.getCurrentPeriodNumber() + 1; i < periods.length; i++) {
      futurePeriods.push(periods[i]);
    }
    return futurePeriods;
  };
  BellTimer.prototype.getPreviousPeriod = function(date) {
    var completedPeriods = this.getCompletedPeriods();
    if (this.getCompletedPeriods().length > 0)
      return _.last(this.getCompletedPeriods());

    if (!date) date = self.getDate();
    var date = new Date(date.getTime());
    date.setDate(date.getDate() - 1);

    var schedule = this.getCurrentSchedule(date);
    if (schedule.periods.length > 0)
      return _.last(schedule.periods);
    else
      return this.getPreviousPeriod(date);
  };
  BellTimer.prototype.getCurrentSchedule = function(date) {
    if (!date) date = self.getDate();
    var dateString = date.toDateString();
    var specialDay = self.calendar.specialDays[dateString];

    var schedule;
    if (specialDay) {
      schedule = self.schedules[specialDay.scheduleName];
      schedule.displayName = specialDay.customName;
    } else {
      schedule = self.schedules[self.calendar.defaultWeek[date.getDay()]];
    }

    for (var i in schedule.periods) {
      var timestamp = timeArrayToDate(date, schedule.periods[i].time, true);
      schedule.periods[i].timestamp = timestamp;
    }

    return schedule;
  };
  BellTimer.prototype.synchronize = function(n, callback) {
    var getTimeCorrection = function(callback) {
      var sentTime = Date.now();
      $.get('/api/time', function(data) {
        var serverTime = data.time;
        var currentTime = Date.now();

        var delay = Math.floor((currentTime - sentTime) / 2);
        var correctedTime = serverTime + delay;
        var correction = correctedTime - currentTime;

        callback(null, correction);
      });
    };

    var synchronize = function(n, callback) {
      var sum = function(nums) {
        return nums.reduce(function(x, y) {
          return x + y;
        });
      };
      var avg = function(nums) {
        return sum(nums) / nums.length;
      };
      var med = function(nums) {
        return nums.sort()[Math.floor(nums.length / 2)];
      };
      var stdev = function(nums) {
        var mean = avg(nums);
        return Math.sqrt(sum(nums.map(function(x) {
          return (x - mean) * (x - mean);
        })) / nums.length);
      };
      var removeOutliers = function(nums) {
        var nums = _.cloneDeep(nums);
        var standardDeviation = stdev(nums);
        var median = med(nums);
        for (var i = 0; i < nums.length; i++) {
          if (Math.abs(nums[i] - median) > standardDeviation) {
            nums.splice(i, 1);
            i--;
          }
        }
        return nums;
      };

      var startTime = Date.now();
      async.timesSeries(n, function(n, callback) {
        _.delay(getTimeCorrection, 10, callback);
      }, function(err, allCorrections) {

        self.debug('Synchronization corrections: ' + allCorrections);
        var correction = _.flow([removeOutliers, avg, _.floor])(allCorrections);
        self.debug('Correction: ' + correction);
        self.debug('Took ' + (Date.now() - startTime) + ' ms to synchronize');

        self.synchronizationCorrection = correction;

        callback(err, correction);
      });
    };

    synchronize(n, callback);
  };

  module.exports = BellTimer;
  //window.BellTimer = BellTimer;
})();