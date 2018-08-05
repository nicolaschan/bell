require('dotenv-safe').config()

const logger = require('loggy')
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)

app.use('/api/data', require('./api/data'))

server.listen(process.env.WEBSERVER_PORT, err => {
  if (err) {
    logger.error(err)
  } else {
    logger.success(`Web server listening on *:${process.env.WEBSERVER_PORT}`)
  }
})
