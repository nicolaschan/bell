require('dotenv-safe').config()

const logger = require('loggy')
const os = require('os')
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const register = require('./register')

app.use('/api/data', require('./api/data'))

function startWebServer () {
  return new Promise((resolve, reject) => {
    server.listen(process.env.WEBSERVER_PORT, err => {
      if (err) {
        reject(err)
      } else {
        logger.success(`Web server listening on *:${process.env.WEBSERVER_PORT}`)
        resolve()
      }
    })
  })
}

Promise.resolve()
  .then(startWebServer)
  .then(register.registerApi)
  .catch(logger.error)
