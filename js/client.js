const async = require('async');
const _ = require('lodash');
const $ = require('jquery');
const Cookies = require('js-cookie');
const Visibility = require('visibilityjs');
const BellTimer = require('./BellTimer.js');
const SimpleLogger = require('./SimpleLogger.js');
const CookieManager = require('./CookieManager.js');
const ThemeManager = require('./ThemeManager.js');
const ClassesManager = require('./ClassesManager.js');
const AnalyticsManager = require('./AnalyticsManager.js');
const UIManager = require('./UIManager.js');
const IntervalManager = require('./IntervalManager.js');

var logger = new SimpleLogger();
logger.setLevel('warn');
var cookieManager = new CookieManager(Cookies);
var themeManager = new ThemeManager(cookieManager);
var classesManager = new ClassesManager(cookieManager);
var analyticsManager = new AnalyticsManager(cookieManager, themeManager, logger);
var bellTimer = new BellTimer(classesManager);
var uiManager = new UIManager(bellTimer, cookieManager, themeManager, classesManager, analyticsManager);

var intervals = {
  fast: {
    start: function(func, callback) {
      callback(setInterval(func, 1000 / 30));
    },
    func: uiManager.updateGraphics
  },
  oneSecond: {
    start: function(func, callback) {
      setTimeout(function() {
        func();
        callback(setInterval(function() {
          func();

          // This function should be called every second, on the second.
          // Detect if it is more than 100 ms off, and if so, restart interval.
          var waitUntilNextTick = bellTimer.getWaitUntilNextTick();
          var offset = Math.min(waitUntilNextTick, 1000 - waitUntilNextTick);
          if (offset > 100 && (Visibility.state() == 'visible')) {
            logger.debug('Tick offset was ' + offset + ' ms, restarting interval...');
            intervalManager.restart('oneSecond');
          }
        }, 1000));
      }, 1000 - bellTimer.getWaitUntilNextTick());
    },
    func: uiManager.update
  },
  background: {
    start: function(func, callback) {
      callback(setInterval(func, 4 * 60 * 1000));
    },
    func: function() {
      logger.info('Loading data and synchronizing...');
      bellTimer.initialize(10, function() {
        logger.success('Bell timer reloaded');
        logger.info('Synchronization correction: ' + bellTimer.synchronizationCorrection);
        intervalManager.restart('oneSecond');
      });
    }
  }
};
var intervalManager = new IntervalManager(intervals);
bellTimer.setDebugLogFunction(logger.debug);
//bellTimer.enableDevMode(new Date('2017-02-16 23:59:55'), 1);

global.bellTimer = bellTimer;
global.logger = logger;
logger.info('Type `logger.setLevel(\'debug\')` to enable debug logging');

$(window).on('load', function() {
  async.series([

    // Initialize BellTimer
    async.asyncify(_.partial(logger.info, 'Loading data...')),
    async.asyncify(_.partial(uiManager.setLoadingMessage, 'Loading')),
    _.partial(bellTimer.reloadData),
    async.asyncify(_.partial(logger.info, 'Synchronizing...')),
    async.asyncify(_.partial(uiManager.setLoadingMessage, 'Synchronizing')),
    _.partial(bellTimer.initializeTimesync),
    async.asyncify(_.partial(logger.success, 'Bell timer initialized')),
    async.asyncify(uiManager.hideLoading),

    // Initialize UIManager
    async.asyncify(uiManager.initialize),
    async.asyncify(uiManager.update),
    async.asyncify(_.partial(logger.success, 'UI initialized and updated')),

    // Start intervals
    //async.asyncify(),

    // Report analytics
    analyticsManager.reportAnalytics

  ], function(err) {

    intervalManager.startAll();
    logger.success('Ready!');

    // var adjustment = Math.round(bellTimer.getCorrection() / 1000);
    // var adjustmentString = adjustment + ' ' + ((adjustment == 1) ? 'second' : 'seconds');
    // uiManager.showAlert('Adjusted ' + adjustmentString + ' to match school time');

  });
});