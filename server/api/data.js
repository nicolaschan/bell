const express = require('express')
const router = express.Router()
const data = require('../data')
const Cache = require('../cache2')

router.get('/:source/meta', async (req, res) => {
  try {
    var meta = await data.getMeta(req.params.source)
    return res.json(meta)
  } catch (e) {
    res.status(404).send('Not found')
  }
})
router.get('/:source/correction', async (req, res) => {
  res.set('Content-Type', 'text/plain')
  try {
    var correction = await data.getCorrection(req.params.source)
    return res.send(correction ? correction.toString() : '0')
  } catch (e) {
    res.status(404).send('Not found')
  }
})
router.get('/:source/calendar', async (req, res) => {
  res.set('Content-Type', 'text/plain')
  try {
    var calendar = await data.getCalendar(req.params.source)
    return res.send(calendar)
  } catch (e) {
    res.status(404).send('Not found')
  }
})
router.get('/:source/schedules', async (req, res) => {
  res.set('Content-Type', 'text/plain')
  try {
    var schedules = await data.getSchedules(req.params.source)
    return res.send(schedules)
  } catch (e) {
    res.status(404).send('Not found')
  }
})
router.get('/:source/message', async (req, res) => {
  try {
    return res.json(await data.getMessage(req.params.source))
  } catch (e) {
    res.status(404).send('Not found')
  }
})

const sourceCache = new Cache(10 * 60)
const getAllCached = sourceCache.cached(key => data.getAll(key))

router.get('/:source', async (req, res) => {
  try {
    const all = await getAllCached(req.params.source)
    res.json(all)
  } catch (e) {
    res.status(404).send('Not found')
  }
})

router.get('/:source/invalidate', async (req, res) => {
  try {
    sourceCache.invalidate(req.params.source)
    res.status(200).send('OK')
  } catch (e) {
    console.error(e)
    res.status(404).send('Not found')
  }
})

module.exports = router
