// Local dependencies
const ChromeCookieManagerFactory = require('./ChromeCookieManager2.js')
const BellTimer = require('../../src/BellTimer.js')
const ThemeManager = require('../../src/ThemeManager.js')
const RequestManager = require('./ChromeExtensionRequestManager')
const ExtUI = require('./ExtUI.js')
const ExtUIModel = require('./ExtUIModel.js')

const hostname = 'https://countdown.zone'

var cookman
var thememan
var reqman
var bellTimer
var extUIModel
var extUI

var setup = function () {
  global.cookman = cookman
  global.bellTimer = bellTimer
  var updateAll = function () {
    extUI.redraw()
    window.requestAnimationFrame(updateAll)
  }
  window.requestAnimationFrame(updateAll)
}

var initializePopup = async function () {
  thememan = new ThemeManager(cookman)
  reqman = new RequestManager(cookman, hostname)
  bellTimer = new BellTimer(cookman, reqman)
  extUIModel = new ExtUIModel(bellTimer, cookman, thememan, reqman)
  extUI = new ExtUI(extUIModel)
  global.cookman = cookman
  global.bellTimer = bellTimer

  extUIModel.setLoadingMessage('Synchronizing')
  await bellTimer.initialize()
  extUIModel.initialize()
  setup()
}

var somethingWentWrong = function (err) {
  console.error(err)
  var c = document.getElementById('circle')
  var ctx = c.getContext('2d')
  ctx.fillStyle = 'red'
  ctx.font = '18px Roboto'
  ctx.fillText('Something went really wrong.', 0, 20)
  ctx.fillText('Whoops.', 0, 40)
}

document.addEventListener('DOMContentLoaded', async function () {
  try {
    cookman = await ChromeCookieManagerFactory()
    initializePopup()
  } catch (e) {
    somethingWentWrong()
    console.log(e.stack)
  }
}, false)
