const express = require('express')
const router = express.Router()
const shortid = require('shortid')
const data = require('../data')

router.get('/version', async (req, res) => {
  try {
    res.json({ version: await data.getVersion()})
  } catch (e) {
    res.status(500).send('Error reading version')
  }
})
router.get('/uuid', (req, res) => {
  res.json({
    id: shortid.generate()
  })
})
router.get('/error', (req, res) => {
  res.status(400).send('Bad request')
})

module.exports = broadcast => async function () {
  router.use('/stats', await require('./analytics')(broadcast))
  router.use('/data', require('./data'))
  router.use('/sources', require('./sources'))
  return router
}
