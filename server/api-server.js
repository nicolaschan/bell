require('dotenv-safe').config()

const logger = require('loggy')
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const register = require('./register')
const checkForNewVersion = require('./updates')

app.use('/api/data', require('./api/data'))

function startWebServer () {
  return new Promise((resolve, reject) => {
    server.listen(process.env.WEBSERVER_PORT, err => {
      if (err) {
        reject(err)
      } else {
        logger.log(`Web server listening on *:${process.env.WEBSERVER_PORT}`)
        resolve()
      }
    })
  })
}

setInterval(checkForNewVersion, 24 * 60 * 60 * 1000)

Promise.resolve()
  .then(startWebServer)
  .then(register.registerApi)
  .then(checkForNewVersion)
  .then(() => logger.success('Bell API started'))
  .catch(logger.error)
