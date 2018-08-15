const UnexpectedErrorHandler = require('./UnexpectedErrorHandler').default
const handler = new UnexpectedErrorHandler()
handler.initialize()

const $ = require('jquery')
const SimpleLogger = require('./SimpleLogger').default
const AnalyticsManager = require('./AnalyticsManager2').default
const MithrilUI = require('./MithrilUI')
const VERSION = require('./Version')
global.VERSION = VERSION

var logger = new SimpleLogger()

const mithrilUI = new MithrilUI()
const analyticsManager = new AnalyticsManager(logger)
const greet = require('./Greeter').default

setInterval(function () {
  mithrilUI.redraw()
}, 1000 / 10)

$(window).on('load', async function () {
  logger.info(`bell-countdown version ${VERSION}`)

  logger.success('Ready!')
  greet()
  await analyticsManager.reportAnalytics()
})

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/bin/service-worker.js', {
    scope: './'
  })
}
