require('dotenv-safe').config()

const Promise = require('bluebird')
const logger = require('loggy')
const express = require('express')

const setupApp = useH2 => {
  logger.info(`Using HTTP/${useH2 ? '2' : '1.1'}`)
  const http2Express = require('http2-express')
  const app = useH2 ? http2Express(express) : express()
  const http = require(useH2 ? 'http2' : 'http')
  const server = http.createServer(app)
  return [app, server]
}

const [app, server] = setupApp(process.env.USE_H2 === 'true')

const compression = require('compression')
app.use(compression())

const path = require('path')
const timesyncServer = require('timesync/server')
const WebSocket = require('ws')

const register = require('./register')
const checkForNewVersion = require('./updates')
const baseDir = path.join(__dirname, '..')

let wss
if (process.env.ENABLE_WS_HITS) {
  wss = new WebSocket.Server({ server })
}

const broadcast = data => {
  if (process.env.ENABLE_WS_HITS === 'true') {
    wss.clients.forEach(client => client.send(data))
  }
}

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
  if (process.env.STATS_REDIRECT.startsWith('http://') ||
    process.env.STATS_REDIRECT.startsWith('https://')) {
    res.redirect(process.env.STATS_REDIRECT)
  } else {
    res.sendFile(path.join(baseDir, 'html', 'stats.html'))
  }
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
app.get('/css/mithril-selector.min.css', (req, res) => {
  res.sendFile(path.join(baseDir, 'node_modules', 'mithril-selector', 'style', 'dist', 'default.min.css'))
})

app.use('/favicons', express.static('favicons'))
app.use('/bin', express.static('bin'))
app.use('/css', express.static('css'))
app.use('/img', express.static('img'))
app.use('/sounds', express.static('sounds'))
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

app.get('/:source', (req, res) => {
  res.sendFile(path.join(baseDir, 'html', 'index.html'))
})

setInterval(checkForNewVersion, 24 * 60 * 60 * 1000)

Promise.resolve()
  .then(() => logger.log('Initializing API'))
  .then(require('./api')(broadcast))
  .then(api => app.use('/api', api))
  .then(() => logger.log('Starting web server'))
  .then(startWebServer)
  .then(register.registerServer)
  .then(checkForNewVersion)
  .then(() => logger.success('Ready to accept connections'))
  .catch(logger.error)
