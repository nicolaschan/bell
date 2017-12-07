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
const MithrilUI = require('./MithrilUI.js');
const UIModel = require('./UIModel.js');
const ChromeExtensionMessenger = require('./ChromeExtensionMessenger');
const PopupModel = require('./PopupModel');

var logger = new SimpleLogger();
logger.setLevel('info');

var cookieManager = new CookieManager3();
var cookieManager2 = new CookieManager2();

var requestManager = new RequestManager(cookieManager);
var themeManager = new ThemeManager(cookieManager);
var analyticsManager = new AnalyticsManager(cookieManager, themeManager, logger);
var bellTimer = new BellTimer(cookieManager, requestManager);
var popupModel = new PopupModel(cookieManager, requestManager);
var uiModel = new UIModel(bellTimer, cookieManager, themeManager, analyticsManager, requestManager, popupModel);
var mithrilUI = new MithrilUI(uiModel);
var chromeExtensionMessenger = new ChromeExtensionMessenger(cookieManager);

bellTimer.setDebugLogFunction(logger.debug);

global.bellTimer = bellTimer;
global.logger = logger;
global.cookieManager = cookieManager;
global.$ = $;
global.requestManager = requestManager;
global.uiModel = uiModel;
global.mithrilUI = mithrilUI;

logger.info('Type `logger.setLevel(\'debug\')` to enable debug logging');

window.requestAnimationFrame(() => mithrilUI.redraw());
setInterval(function() {
    logger.debug('Refreshing data');
    bellTimer.reloadData();
    popupModel.refresh();
}, 4 * 60 * 1000);

$(window).on('load', async function() {
    uiModel.setLoadingMessage('Loading');
    await cookieManager.initialize();
    await cookieManager.convertLegacy(cookieManager2, 2);
    chromeExtensionMessenger.connect('pkeeekfbjjpdkbijkjfljamglegfaikc');

    logger.debug('Initializing BellTimer');
    uiModel.setLoadingMessage('Synchronizing');
    await bellTimer.initialize();
    logger.debug('BellTimer initialized');

    uiModel.initialize();
    logger.success('Ready!');
    uiModel.hideLoading();

    logger.debug('Reporting analytics');
    analyticsManager.reportAnalytics();
});

var greetings = ['Hello', 'Hi there', 'Greetings', 'Howdy'];
var greeting = greetings[Math.floor(Math.random() * greetings.length)];
var colors = ['red', 'orange', 'lime', 'darkblue', 'magenta'];
var color = colors[Math.floor(Math.random() * colors.length)];
var emojis = ['😸', '💻', '😀', '⏱', '🙃', '😁', '😎', '🙀', '🦄', '🤠'];
var emoji = emojis[Math.floor(Math.random() * emojis.length)];
console.log(`%c${emoji} ${greeting}! Looking for the code? This is an open source project and we welcome contributions.\n\
    %c👀 View the code: %chttps://github.com/nicolaschan/bell
    %c🐞 Report a bug: %chttps://github.com/nicolaschan/bell/issues`,
    `color:${color};font-weight:900;font-size:18px;font-family:sans-serif`,
    "color:black;font-size:18px;font-family:sans-serif",
    "color:blue;font-size:18px;font-family:sans-serif",
    "color:black;font-size:18px;font-family:sans-serif",
    "color:blue;font-size:18px;font-family:sans-serif");