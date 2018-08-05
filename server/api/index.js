const express = require('express')
const router = express.Router()
const shortid = require('shortid')
const data = require('../data')

router.get('/version', async (req, res) => {
  res.set('Content-Type', 'text/plain')
  try {
    res.send(await data.getVersion())
  } catch (e) {
    res.status(500).send('Error reading version')
  }
})
router.get('/uuid', (req, res) => {
  res.set('Content-Type', 'text/json')
  res.send({
    id: shortid.generate()
  })
})
router.get('/time', (req, res) => {
  res.json({
    time: Date.now()
  })
})
router.get('/error', (req, res) => {
  res.status(400).send('Bad request')
})

module.exports = async function () {
  router.use('/stats', await require('./analytics')())
  router.use('/data', require('./data'))
  router.use('/sources', require('./sources'))
  return router
}
