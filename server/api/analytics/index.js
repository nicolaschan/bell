const crypto = require('crypto')
const logger = require('loggy')
const express = require('express')
const router = express.Router()

const analyticsHandler = require(
  (process.env.POSTGRES_ENABLED === 'true')
    ? './PostgresAnalyticsHandler' : './SqliteAnalyticsHandler')

function getIp (req) {
  // https://stackoverflow.com/a/10849772/
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress
}

function extractRegisterBody (req) {
  return {
    id: req.body.id,
    version: req.body.version,
    os: req.body.os,
    node: req.body.node,
    ip: getIp(req)
  }
}

module.exports = async function (broadcast) {
  router.get('/', async (req, res) => {
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
  router.post('/hit', async (req, res) => {
    try {
      await analyticsHandler.recordHit({
        id: req.body.id,
        userAgent: req.body.userAgent,
        theme: req.body.theme,
        source: req.body.source,
        version: req.body.version,
        ip: getIp(req)
      })
      res.json({ success: true })
      broadcast(crypto.createHash('md5').update(req.body.id).digest('hex').substring(0, 1))
    } catch (e) {
      logger.error(e)
      res.json({ success: false })
    }
  })
  router.post('/server', async (req, res) => {
    try {
      await analyticsHandler.recordServer(extractRegisterBody(req))
      return res.json({ success: true })
    } catch (e) {
      logger.error(e)
      return res.json({ success: false })
    }
  })
  router.post('/api', async (req, res) => {
    try {
      await analyticsHandler.recordApi(extractRegisterBody(req))
      return res.json({ success: true })
    } catch (e) {
      logger.error(e)
      return res.json({ success: false })
    }
  })
  router.post('/errors', async (req, res) => {
    try {
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
    } catch (e) {
      logger.error(e)
      return res.json({ success: false })
    }
  })

  try {
    await analyticsHandler.initialize()
  } catch (e) {
    logger.error(e)
  }
  return router
}
