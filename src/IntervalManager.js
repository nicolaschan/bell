(function() {

  var self;

  var IntervalManager = function(intervals) {
    self = this;

    this.intervals = intervals;
  };

  IntervalManager.prototype.start = function(name) {
    var interval = this.intervals[name];

    clearInterval(interval.interval);
    interval.interval = null;

    interval.start(interval.func, function(newInterval) {
      interval.interval = newInterval;
    });
  };
  IntervalManager.prototype.restart = IntervalManager.prototype.start;

  IntervalManager.prototype.startAll = function() {
    for (var name in this.intervals)
      self.start(name);
  };

  module.exports = IntervalManager;
  //window.IntervalManager = IntervalManager;
})();