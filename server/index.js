require('dotenv-safe').config()

const Promise = require('bluebird')
const logger = require('loggy')
const http = require('http')
const express = require('express')
const app = express()
const server = http.createServer(app)
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const uuid = require('uuid/v4')
const request = Promise.promisifyAll(require('request'))
const os = require('os')
const timesyncServer = require('timesync/server')
const compareVersions = require('compare-versions')

const data = require('./data')
const baseDir = path.join(__dirname, '..')

app.get('/', (req, res) => {
  res.sendFile(path.join(baseDir, 'html', 'index.html'))
})
app.get('/offline', (req, res) => {
  res.sendFile(path.join(baseDir, 'html', 'offline.html'))
})
app.get('/periods', (req, res) => {
  res.sendFile(path.join(baseDir, 'html', 'index.html'))
})
app.get('/classes', (req, res) => {
  res.sendFile(path.join(baseDir, 'html', 'index.html'))
})
app.get('/enter', (req, res) => {
  res.sendFile(path.join(baseDir, 'html', 'index.html'))
})
app.get('/settings', (req, res) => {
  res.sendFile(path.join(baseDir, 'html', 'index.html'))
})
app.get('/stats', (req, res) => {
  res.sendFile(path.join(baseDir, 'html', 'stats.html'))
})

app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(baseDir, 'manifest.json'))
})

app.get('/bin/service-worker.js', (req, res) => {
  res.set('Service-Worker-Allowed', '/')
  res.set('Cache-Control', 'no-cache, public')
  res.sendFile(path.join(baseDir, 'bin', 'service-worker.js'))
})
app.get('/xt', (req, res) => {
  res.redirect('https://chrome.google.com/webstore/detail/belllahsclub-extension/pkeeekfbjjpdkbijkjfljamglegfaikc')
})
app.get('/extension', (req, res) => {
  res.redirect('https://chrome.google.com/webstore/detail/belllahsclub-extension/pkeeekfbjjpdkbijkjfljamglegfaikc')
})
app.get('/gh', (req, res) => {
  res.redirect('https://github.com/nicolaschan/bell')
})
app.get('/about', (req, res) => {
  res.redirect('https://github.com/nicolaschan/bell/blob/master/README.md')
})

var bodyParser = require('body-parser')
app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}))
app.use('/timesync', timesyncServer.requestHandler)

app.get('/css/selectize.css', (req, res) => {
  res.sendFile(path.join(baseDir, 'node_modules', 'selectize', 'dist', 'css', 'selectize.default.css'))
})
app.get('/css/bootstrap.min.css', (req, res) => {
  res.sendFile(path.join(baseDir, 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.min.css'))
})
app.get('/css/bootstrap.min.css.map', (req, res) => {
  res.sendFile(path.join(baseDir, 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.min.css.map'))
})

app.use('/favicons', express.static('favicons'))
app.use('/bin', express.static('bin'))
app.use('/css', express.static('css'))
app.use('/img', express.static('img'))
app.use('/icons', express.static(path.join(baseDir, 'node_modules', 'material-design-icons'), {
  maxage: '24h'
}))
app.use('/fonts', express.static(path.join(baseDir, 'node_modules', 'roboto-fontface', 'fonts'), {
  maxage: '24h'
}))

var startWebServer = function () {
  return new Promise((resolve, reject) => {
    server.listen(process.env.WEBSERVER_PORT, err => {
      if (err) { return reject(err) }
      logger.log(`Web server listening on *:${process.env.WEBSERVER_PORT}`)
      return resolve()
    })
  })
}

var getServerID = async function () {
  var idFile = path.join(__dirname, '..', 'id.txt')
  try {
    var id = await fs.readFileAsync(idFile)
    return id
  } catch (e) {
    var newId = uuid()
    await fs.writeFileAsync(idFile, newId)
    return newId
  }
}

var reportUsage = async function () {
  var serverId = await getServerID()
  try {
    await request.postAsync('https://countdown.zone/api/analytics/server', {
      form: {
        id: serverId,
        os: {
          platform: os.platform(),
          release: os.release(),
          type: os.type(),
          arch: os.arch()
        },
        node: process.version,
        version: await data.getVersion()
      }
    })
  } catch (e) {
    // Failed to report this server instance
  }
}

var newestVersion
var getNewestVersion = async function () {
  try {
    var version = await request.getAsync('https://countdown.zone/api/version')
    return version.body
  } catch (e) {
    // Failed to check for a new version
    throw new Error('Failed to check for a new version')
  }
}
var alertAboutVersionChange = function (localVersion, remoteVersion) {
  const comparison = compareVersions(localVersion, remoteVersion)

  if (comparison > 0) {
    // Local version is greater than the remote version
    logger.info(`This is future version bell-countdown@${localVersion} (countdown.zone is ${remoteVersion})`)
  } else if (comparison < 0) {
    // Local version is less than the remote version
    logger.warn('There is a new version of bell-countdown available')
    logger.warn(`You are using ${localVersion} while the newest version available is ${remoteVersion}`)
    logger.warn('Please update by visiting https://countdown.zone/gh')
  } else {
    // Local version matches remote version
    logger.info(`bell-countdown@${localVersion} is up to date`)
  }
}

var checkForNewVersion = async function () {
  try {
    var version = await getNewestVersion()
    if (version !== newestVersion) {
      newestVersion = version
      alertAboutVersionChange(await data.getVersion(), newestVersion)
    }
  } catch (e) {
    logger.warn('Check for new version failed — check your internet connection')
    logger.warn(e)
  }
}
setInterval(checkForNewVersion, 24 * 60 * 60 * 1000)

Promise.resolve()
  .then(() => logger.log('Initializing API'))
  .then(require('./api'))
  .then(api => app.use('/api', api))
  .then(() => logger.log('Starting web server'))
  .then(startWebServer)
  .then(reportUsage)
  .then(checkForNewVersion)
  .then(() => logger.success('Ready to accept connections'))
