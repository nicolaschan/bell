const bodyParser = require('body-parser')
const express = require('express')
const shortid = require('shortid')

const data = require('../server/data')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use((req, res, next) => {
  const url = new URL(req.url, 'http://localhost')
  const path = url.searchParams.get('path')

  if ((url.pathname === '/api' || url.pathname === '/api/index' || url.pathname === '/api/index.js') && path) {
    url.pathname = `/api/${path}`
    url.searchParams.delete('path')
    req.url = `${url.pathname}${url.search}`
  }

  next()
})

app.get('/api/version', async (req, res) => {
  try {
    res.json({ version: await data.getVersion() })
  } catch (e) {
    res.status(500).send('Error reading version')
  }
})

app.get('/api/uuid', (req, res) => {
  res.json({ id: shortid.generate() })
})

app.get('/api/error', (req, res) => {
  res.status(400).send('Bad request')
})

app.post('/api/stats/:event?', (req, res) => {
  res.json({ success: false, disabled: true })
})

app.use('/api/data', require('../server/api/data'))
app.use('/api/sources', require('../server/api/sources'))

module.exports = app
