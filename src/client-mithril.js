const $ = require('jquery')
const CookieManager3 = require('./CookieManager3.js')
const BellTimer = require('./BellTimer.js')
const SimpleLogger = require('./SimpleLogger.js')
const RequestManager = require('./RequestManager')
const ThemeManager = require('./ThemeManager.js')
const AnalyticsManager = require('./AnalyticsManager2.js')
const MithrilUI = require('./MithrilUI.js')
const UIModel = require('./UIModel.js')
const ChromeExtensionMessenger = require('./ChromeExtensionMessenger')
const PopupModel = require('./PopupModel')
const processQuery = require('./QueryManager')

var logger = new SimpleLogger()
logger.setLevel('info')

var cookieManager = new CookieManager3()

var requestManager = new RequestManager(cookieManager)
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
global.VERSION = require('../package.json').version

logger.info('Type `logger.setLevel(\'debug\')` to enable debug logging')

setInterval(function () {
  mithrilUI.redraw()
}, 1000 / 30)
setInterval(function () {
  logger.debug('Refreshing data')
  bellTimer.reloadData()
  popupModel.refresh()
}, 4 * 60 * 1000)

$(window).on('load', async function () {
  uiModel.setLoadingMessage('Loading')
  await cookieManager.initialize()
  processQuery(window.location.href, cookieManager)
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
        version: require('../package.json').version
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
