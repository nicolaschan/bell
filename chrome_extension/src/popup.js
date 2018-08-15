// Local dependencies
const ChromeCookieManagerFactory = require('./ChromeCookieManager2')
const BellTimer = require('../../src/BellTimer2').default
const ThemeManager = require('../../src/ThemeManager').default
const RequestManager = require('./ChromeExtensionRequestManager')
const CorrectedDate = require('../../src/CorrectedDate').default
const SynchronizedDate = require('../../src/SynchronizedDate').default
const ExtUI = require('./ExtUI.js')
const ExtUIModel = require('./ExtUIModel')

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

global.firstTime = true
global.initializePopup = async function () {
  thememan = new ThemeManager(cookman.get('theme'))
  reqman = new RequestManager(cookman)
  bellTimer = new BellTimer(
    cookman.get('source', 'lahs'),
    new CorrectedDate(new SynchronizedDate()),
    cookman.get('periods', {}),
    cookman.get('courses', {}),
    reqman)
  extUIModel = new ExtUIModel(bellTimer, cookman, thememan, reqman)
  global.extUIModel = extUIModel
  global.cookman = cookman
  global.reqman = reqman
  global.bellTimer = bellTimer
  global.thememan = thememan

  extUI = new ExtUI(extUIModel)
  await bellTimer.reloadData()
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
    global.initializePopup()
  } catch (e) {
    somethingWentWrong()
    console.log(e.stack)
  }
}, false)
