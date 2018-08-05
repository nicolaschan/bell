const $ = require('jquery')
const CookieManager3 = require('./CookieManager3')
const BellTimer = require('./BellTimer')
const SimpleLogger = require('./SimpleLogger')
const RequestManager = require('./RequestManager')
const ThemeManager = require('./ThemeManager')
const AnalyticsManager = require('./AnalyticsManager2')
const MithrilUI = require('./MithrilUI')
const UIModel = require('./UIModel')
const ChromeExtensionMessenger = require('./ChromeExtensionMessenger')
const PopupModel = require('./PopupModel')
const processQuery = require('./QueryManager')

var logger = new SimpleLogger()
logger.setLevel('info')

var cookieManager = new CookieManager3()

var request = {
  get: async (url) => {
    return $.get(url)
  },
  post: async (url, data) => {
    return $.post(url, data)
  }
}
var requestManager = new RequestManager(request)
// Clean up old request cache
cookieManager.remove('requestCache')

var themeManager = new ThemeManager(cookieManager)
var analyticsManager = new AnalyticsManager(cookieManager, themeManager, requestManager, logger)
var bellTimer = new BellTimer(cookieManager, requestManager)
var popupModel = new PopupModel(cookieManager, requestManager)
var uiModel = new UIModel(bellTimer, cookieManager, themeManager, analyticsManager, requestManager, popupModel)
var mithrilUI = new MithrilUI(uiModel)
var chromeExtensionMessenger = new ChromeExtensionMessenger(cookieManager)

global.themeManager = themeManager
global.bellTimer = bellTimer
global.logger = logger
global.cookieManager = cookieManager
global.$ = $
global.requestManager = requestManager
global.uiModel = uiModel
global.mithrilUI = mithrilUI
global.m = require('mithril')
const VERSION = require('./Version')
global.VERSION = VERSION

logger.info('Type `logger.setLevel(\'debug\')` to enable debug logging')

setInterval(function () {
  mithrilUI.redraw()
}, 1000 / 30)
setInterval(function () {
  logger.debug('Refreshing data')
  bellTimer.reloadData()
  popupModel.refresh()
}, 60 * 1000)

$(window).on('load', async function () {
  logger.info(`bell-countdown version ${VERSION}`)
  uiModel.setLoadingMessage('Loading')
  await cookieManager.initialize()
  await processQuery(window.location.href, cookieManager)
  // CHANGE THIS FOR LOCAL TESTING TO THE ID FOUND IN CHROME://EXTENSIONS
  chromeExtensionMessenger.connect('pkeeekfbjjpdkbijkjfljamglegfaikc')
  uiModel.setLoadingMessage('Synchronizing')
  popupModel.refresh()
  await bellTimer.initialize()

  uiModel.initialize()
  logger.success('Ready!')

  logger.debug('Reporting analytics')
  await analyticsManager.reportAnalytics()
})

var hasSentReport = false
window.onunhandledrejection = async function (e) {
  console.error(e)
  try {
    if (!hasSentReport) {
      hasSentReport = true
      logger.debug('Sending error report')
      await requestManager.post('/api/errors', {
        id: cookieManager.get('id'),
        theme: themeManager.currentThemeName,
        userAgent: window.navigator.userAgent,
        source: cookieManager.get('source'),
        error: {
          columnNumber: e.reason.columnNumber,
          fileName: e.reason.fileName,
          lineNumber: e.reason.lineNumber,
          name: e.reason.name,
          message: e.reason.message,
          stack: e.reason.stack
        },
        version: require('./Version')
      })
    }
  } catch (requestError) {
    console.error(requestError)
  }
  if (!uiModel.state.ready) {
    await cookieManager.clear()
    uiModel.setErrorMessage('An error occurred')
  }
}

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/bin/service-worker.js', {
    scope: './'
  })
}

var greetings = ['Hello', 'Hi there', 'Greetings', 'Howdy']
var greeting = greetings[Math.floor(Math.random() * greetings.length)]
var colors = ['red', 'orange', 'lime', 'darkblue', 'magenta']
var color = colors[Math.floor(Math.random() * colors.length)]
var emojis = ['😸', '💻', '😀', '⏱', '🙃', '😁', '😎', '🙀', '🦄', '🤠']
var emoji = emojis[Math.floor(Math.random() * emojis.length)]
console.log(`%c${emoji} ${greeting}! Looking for the code? This is an open source project and we welcome contributions.
    %c👀 View the code: %chttps://github.com/nicolaschan/bell
    %c🐞 Report a bug: %chttps://github.com/nicolaschan/bell/issues`,
`color:${color};font-weight:900;font-size:18px;font-family:sans-serif`,
'color:black;font-size:18px;font-family:sans-serif',
'color:blue;font-size:18px;font-family:sans-serif',
'color:black;font-size:18px;font-family:sans-serif',
'color:blue;font-size:18px;font-family:sans-serif')
