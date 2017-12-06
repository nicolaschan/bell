const async = require('async');
const _ = require('lodash');
const $ = require('jquery');
const Visibility = require('visibilityjs');
const CookieManager3 = require('./CookieManager3.js');
const BellTimer = require('./BellTimer.js');
const SimpleLogger = require('./SimpleLogger.js');
const CookieManager2 = require('./CookieManager2.js');
const RequestManager = require('./RequestManager');
const ThemeManager = require('./ThemeManager.js');
const AnalyticsManager = require('./AnalyticsManager2.js');
const UIManager = require('./UIManager.js');
const IntervalManager = require('./IntervalManager.js');
const ChromeExtensionMessenger = require('./ChromeExtensionMessenger');

var logger = new SimpleLogger();
logger.setLevel('info');

var cookieManager = new CookieManager3();
var cookieManager2 = new CookieManager2();

var requestManager = new RequestManager(cookieManager);
var themeManager = new ThemeManager(cookieManager);
var analyticsManager = new AnalyticsManager(cookieManager, themeManager, logger);
var bellTimer = new BellTimer(cookieManager, requestManager);
var uiManager = new UIManager(bellTimer, cookieManager, themeManager, analyticsManager, requestManager);
var chromeExtensionMessenger = new ChromeExtensionMessenger(cookieManager);

var previousRestart = 0;
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
                    // (Do not restart if it has restarted in the past 10 sec)
                    var waitUntilNextTick = bellTimer.getWaitUntilNextTick();
                    var offset = Math.min(waitUntilNextTick, 1000 - waitUntilNextTick);
                    if (offset > 100 && (Visibility.state() == 'visible') &&
                        (Date.now() - previousRestart > 10000)) {
                        previousRestart = Date.now();
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
            callback(setInterval(func, 4 * 60 * 1000 /*4 * 60 * 1000*/ ));
        },
        func: function() {
            logger.info('Loading data and synchronizing...');
            bellTimer.reloadData().then(function() {
                logger.success('Bell timer reloaded');
                logger.info(`Synchronization correction: ${bellTimer.correction} ms`);
                intervalManager.restart('oneSecond');
            });
            uiManager.loadPopup();
        }
    }
};
var intervalManager = new IntervalManager(intervals);
bellTimer.setDebugLogFunction(logger.debug);

global.bellTimer = bellTimer;
global.logger = logger;
global.cookieManager = cookieManager;
global.$ = $;
global.requestManager = requestManager;

logger.info('Type `logger.setLevel(\'debug\')` to enable debug logging');

// bellTimer.enableDevMode(new Date('2017-05-23 8:00'), 60);

$(window).on('load', async function() {
    uiManager.setLoadingMessage('Loading');
    await cookieManager.initialize();
    await cookieManager.convertLegacy(cookieManager2, 2);
    chromeExtensionMessenger.connect('pkeeekfbjjpdkbijkjfljamglegfaikc');

    logger.debug('Initializing BellTimer');
    uiManager.setLoadingMessage('Synchronizing');
    await bellTimer.initialize();

    await uiManager.initialize();
    logger.debug('UI initialized');

    uiManager.update();
    logger.debug('UI updated');

    // uiManager.setLoadingMessage('Analyzing');
    logger.debug('Reporting analytics');
    await analyticsManager.reportAnalytics();

    logger.debug('Starting intervals');
    intervalManager.startAll();
    logger.success('Ready!');
    uiManager.hideLoading();
});