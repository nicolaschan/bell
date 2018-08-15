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

// TODO: Might be a good idea to move this somewhere else
const requestManager = require('./RequestManager2').default
let version
const checkForNewVersion = async () => {
  try {
    const newVersion = await requestManager.get('/api/version')
    if (version === undefined) {
      version = newVersion
    } else if (version !== newVersion) {
      window.location.reload()
    }
  } catch (e) {
    // no big deal, try again later
  }
}
setInterval(checkForNewVersion, 4 * 60 * 1000)
checkForNewVersion()

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
