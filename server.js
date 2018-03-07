const Promise = require('bluebird')

const config = require('./config.json')
const logger = require('loggy')
const http = require('http')
const express = require('express')
const app = express()
const server = http.createServer(app)
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const shortid = require('shortid')
const uuid = require('uuid/v4')
const request = Promise.promisifyAll(require('request'))
const os = require('os')
const timesyncServer = require('timesync/server')

const cacheTime = 60
const analyticsHandler = config.postgres.enabled ? require('./PostgresAnalyticsHandler') : require('./SqliteAnalyticsHandler')

var previousCheck = 0
var cache = function (time, f) {
  // takes a function and caches its result
  // for a set number of seconds

  previousCheck = 0
  var cache = {}

  return function () {
    if (Date.now() - previousCheck > 1000 * time) { cache = {} }

    var argumentString = JSON.stringify(arguments)

    if (!cache[argumentString]) {
      previousCheck = Date.now()
      cache[argumentString] = f.apply(null, arguments)
    }

    return cache[argumentString]
  }
}

var getVersion = cache(cacheTime, function () {
  try {
    return JSON.parse(fs.readFileSync('./package.json').toString()).version
  } catch (e) {
    logger.error(e)
  }
})
var getMessage = cache(cacheTime, function () {
  try {
    return JSON.parse(fs.readFileSync(`./data/message.json`).toString())
  } catch (e) {
    logger.error(e)
  }
})

var fetch = async function (source, file) {
  var sourceData = await getSource(source)
  var res
  switch (sourceData.location) {
    case 'local':
      res = await fs.readFileAsync(`data/${source}/${file}`)
      return res.toString()
    case 'web':
      res = await request.getAsync(`${sourceData.url}/api/data/${source}/${file.split('.')[0]}`)
      return res.body
    case 'github':
      var pieces = sourceData.repo.split('/')
      var usernameRepo = pieces.slice(0, 2).join('/')
      var path = pieces.slice(2).join('/')
      res = await request.getAsync(`https://raw.githubusercontent.com/${usernameRepo}/master/${path}/${file}`)
      return res.body
  }
}
var getCorrection = cache(cacheTime, async function (source) {
  return fetch(source, 'correction.txt')
})
var getSchedules = cache(cacheTime, async function (source) {
  return fetch(source, 'schedules.bell')
})
var getCalendar = cache(cacheTime, async function (source) {
  return fetch(source, 'calendar.bell')
})
var getMeta = cache(cacheTime, async function (source) {
  var meta = await fetch(source, 'meta.json')
  return JSON.parse(meta)
})
var getSource = cache(cacheTime, async function (source) {
  // if (source.substring(0, 3) == 'gh:') {
  //     return {
  //         location: 'github',
  //         repo: source.substring(3).split(':').join('/')
  //     };
  // }
  source = await fs.readFileAsync(`data/${source}/source.json`)
  return JSON.parse(source.toString())
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'))
})
app.get('/offline', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'offline.html'))
})
app.get('/periods', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'))
})
app.get('/classes', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'))
})
app.get('/enter', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'))
})
app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'))
})
app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'))
})
app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'stats.html'))
})

app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'manifest.json'))
})

app.get('/bin/service-worker.js', (req, res) => {
  res.set('Service-Worker-Allowed', '/')
  res.set('Cache-Control', 'no-cache, public')
  res.sendFile(path.join(__dirname, 'bin', 'service-worker.js'))
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

app.get('/api/stats', async (req, res) => {
  res.json({
    totalHits: (await analyticsHandler.getTotalDailyHits()).rows,
    uniqueHits: (await analyticsHandler.getUniqueDailyHits()).rows,
    browserStats: (await analyticsHandler.getBrowserStats()).rows,
    osStats: (await analyticsHandler.getOSStats()).rows,
    deviceStats: (await analyticsHandler.getDeviceStats()).rows,
    themeStats: (await analyticsHandler.getThemeStats()).rows,
    sourceStats: (await analyticsHandler.getSourceStats()).rows
  })
})

app.get('/api/sources', async (req, res) => {
  var directories = fs.readdirSync('data').filter(name => fs.lstatSync(path.join('data', name)).isDirectory())

  var sources = []
  for (let directory of directories) {
    var source = await getMeta(directory)
    source.id = directory
    sources.push(source)
  }

  res.json(sources)
})
app.get('/api/sources/names', async (req, res) => {
  var directories = fs.readdirSync('data').filter(name => fs.lstatSync(path.join('data', name)).isDirectory())
  res.json(directories)
})

app.get('/api/data/:source/meta', async (req, res) => {
  try {
    var meta = await getMeta(req.params.source)
    return res.json(meta)
  } catch (e) {
    res.status(404).send('Not found')
  }
})
app.get('/api/data/:source/correction', async (req, res) => {
  res.set('Content-Type', 'text/plain')
  try {
    var correction = await getCorrection(req.params.source)
    return res.send(correction ? correction.toString() : '0')
  } catch (e) {
    res.status(404).send('Not found')
  }
})
app.get('/api/data/:source/calendar', async (req, res) => {
  res.set('Content-Type', 'text/plain')
  try {
    var calendar = await getCalendar(req.params.source)
    return res.send(calendar)
  } catch (e) {
    res.status(404).send('Not found')
  }
})
app.get('/api/data/:source/schedules', async (req, res) => {
  res.set('Content-Type', 'text/plain')
  try {
    var schedules = await getSchedules(req.params.source)
    return res.send(schedules)
  } catch (e) {
    res.status(404).send('Not found')
  }
})
app.get('/api/version', (req, res) => {
  res.set('Content-Type', 'text/plain')
  res.send(getVersion())
})
app.get('/api/message', (req, res) => {
  res.json(getMessage())
})
app.get('/api/uuid', (req, res) => {
  res.set('Content-Type', 'text/json')
  res.send({
    id: shortid.generate()
  })
})
app.get('/api/time', (req, res) => {
  res.json({
    time: Date.now()
  })
})
app.get('/api/error', (req, res) => {
  res.json({
    error: 'Request failed'
  })
})

var bodyParser = require('body-parser')
app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}))
app.use('/timesync', timesyncServer.requestHandler)

app.post('/api/analytics', async (req, res) => {
  try {
    await analyticsHandler.recordHit({
      id: req.body.id,
      userAgent: req.body.userAgent,
      theme: req.body.theme,
      source: req.body.source,
      version: req.body.version,
      // https://stackoverflow.com/a/10849772/
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    })
    return res.json({ success: true })
  } catch (e) {
    logger.error(e)
    return res.json({ success: false })
  }
})
app.post('/api/analytics/server', async (req, res) => {
  try {
    await analyticsHandler.recordServer({
      id: req.body.id,
      version: req.body.version,
      os: req.body.os,
      node: req.body.node,
      // https://stackoverflow.com/a/10849772/
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    })
    return res.json({ success: true })
  } catch (e) {
    logger.error(e)
    return res.json({ success: false })
  }
})
app.post('/api/errors', async (req, res) => {
  await analyticsHandler.recordError({
    id: req.body.id,
    userAgent: req.body.userAgent,
    theme: req.body.theme,
    source: req.body.source,
    error: JSON.stringify(req.body.error),
    version: req.body.version,
    // https://stackoverflow.com/a/10849772/
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
  })
  return res.json({ success: true })
})
app.get('/api/themes', (req, res) => {
  res.set('Content-Type', 'text/json')
  res.sendFile(path.join(__dirname, 'data', 'themes.json'))
})
app.get('/css/selectize.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules', 'selectize', 'dist', 'css', 'selectize.default.css'))
})
app.get('/css/bootstrap.min.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.min.css'))
})
app.get('/css/bootstrap.min.css.map', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.min.css.map'))
})

app.use('/favicons', express.static('favicons'))
app.use('/bin', express.static('bin'))
app.use('/css', express.static('css'))
app.use('/img', express.static('img'))
app.use('/icons', express.static('node_modules/material-design-icons', {
  maxage: '24h'
}))
app.use('/fonts', express.static('node_modules/roboto-fontface/fonts', {
  maxage: '24h'
}))

var startWebServer = function () {
  return new Promise((resolve, reject) => {
    server.listen(config.port, err => {
      if (err) { return reject(err) }
      logger.success('Web server listening on *:' + config.port)
      return resolve()
    })
  })
}

var getServerID = async function () {
  var idFile = path.join(__dirname, 'data', 'id.txt')
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
    await request.postAsync('http://localhost:8080/api/analytics/server', {
      form: {
        id: serverId,
        os: {
          platform: os.platform(),
          release: os.release(),
          type: os.type(),
          arch: os.arch()
        },
        node: process.version,
        version: getVersion()
      }
    })
  } catch (e) {
    // Failed to report this server instance
  }
}

var newestVersion
var getNewestVersion = async function () {
  try {
    var version = (await request.getAsync('https://countdown.zone/api/version')).body
    return version
  } catch (e) {
    // Failed to check for a new version
    throw new Error('Failed to get newest version')
  }
}
var alertAboutVersionChange = function (currentVersion, newVersion) {
  if (currentVersion !== newVersion) {
    logger.warn('There is a new version of bell-countdown available')
    logger.warn(`You are using ${currentVersion} while the newest version available is ${newVersion}`)
    logger.warn('Please update by visiting https://countdown.zone/gh')
    return false
  } else {
    logger.log(`bell-countdown@${currentVersion} is up to date`)
    return true
  }
}

var checkForNewVersion = async function () {
  try {
    var version = await getNewestVersion()
    if (version !== newestVersion) {
      newestVersion = version
      alertAboutVersionChange(getVersion(), newestVersion)
    }
  } catch (e) {
    logger.warn('You may not be online — check your internet connection')
  }
}
setInterval(checkForNewVersion, 24 * cacheTime * cacheTime * 1000)

Promise.resolve()
  .then(() => logger.info('Initializing analytics handler'))
  .then(analyticsHandler.initialize)
  .then(() => logger.info('Starting web server'))
  .then(startWebServer)
  .then(reportUsage)
  .then(checkForNewVersion)
  .then(() => logger.success('Ready'))
