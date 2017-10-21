const $ = require('jquery');

(function() {

  var self;

  var AnalyticsManager = function(cookieManager, themeManager, logger) {
    self = this;

    this.cookieManager = cookieManager;
    this.themeManager = themeManager;
    this.logger = logger;
    this.initialized = false;
    this.newPageLoad = true;
  };
  AnalyticsManager.prototype.initialize = function(callback) {
    if (this.initialized)
      return callback();

    var setUuid = function(callback) {
      $.get('/api/uuid', function(uuid) {
        var uuid = uuid.id;
        self.cookieManager.set('id', uuid);
        callback();
      });
    };
    var ensureUuid = function(callback) {
      var uuid = self.cookieManager.get('id');
      if (!uuid || uuid.length > 12)
        setUuid(callback);
      else
        callback();
    };
    ensureUuid(function() {
      this.initialized = true;
      callback();
    });
  };
  AnalyticsManager.prototype.reportAnalytics = function(callback) {
    var newPageLoad = self.newPageLoad;
    self.newPageLoad = false;

    var report = function(callback) {
      $.ajax({
        type: 'POST',
        url: '/api/analytics',
        data: {
          id: self.cookieManager.get('id'),
          newPageLoad: newPageLoad,
          source: 'web',
          theme: self.themeManager.getCurrentThemeName(),
          userAgent: $(window)[0].navigator.userAgent
        },
        success: function(res) {
          self.newPageLoad = false;

          if (!res.success)
            self.logger.warn('Analytics are disabled');
          else
            self.logger.success('Analytics data sent successfully');

          if (callback)
            callback();
        }
      })
    };

    return self.initialize(function() {
      report(callback);
    });
  };

  module.exports = AnalyticsManager;
  //window.AnalyticsManager = AnalyticsManager;
})();