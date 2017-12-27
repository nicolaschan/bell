const UAParser = require('ua-parser-js')
const config = require('./config.json')

const {
    Client
} = require('pg')
const db = new Client(config.postgres)

const PostgresAnalyticsHandler = {
  initialize: async() => {
    db.connect()
    await db.query(`CREATE TABLE IF NOT EXISTS hits (
        id SERIAL,
        userId TEXT, 
        userAgent TEXT, 
        browser TEXT, 
        device TEXT, 
        os TEXT, 
        theme TEXT, 
        source TEXT, 
        ip TEXT, 
        timestamp TIMESTAMP WITH TIME ZONE
    )`)
    return db.query(`CREATE TABLE IF NOT EXISTS errors (
        id SERIAL,
        userId TEXT, 
        userAgent TEXT, 
        browser TEXT, 
        device TEXT, 
        os TEXT, 
        theme TEXT, 
        source TEXT, 
        ip TEXT,
        error TEXT,
        timestamp TIMESTAMP WITH TIME ZONE
    )`)
  },
  recordHit: async(user) => {
    var result = UAParser(user.userAgent)
    var device = (result.device.vendor && result.device.model) ? `${result.device.vendor} ${result.device.model}` : 'Unknown device'
    return db.query({
      text: `INSERT INTO hits (userId, userAgent, browser, device, os, theme, source, ip, timestamp) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TIMESTAMP 'now')`,
      values: [
        user.id, user.userAgent, result.browser.name, device, result.os.name, user.theme, user.source, user.ip
      ]})
  },
  recordError: async(user) => {
    var result = UAParser(user.userAgent)
    var device = (result.device.vendor && result.device.model) ? `${result.device.vendor} ${result.device.model}` : 'Unknown device'
    return db.query({
      text: `INSERT INTO errors (userId, userAgent, browser, device, os, theme, source, ip, error, timestamp) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TIMESTAMP 'now')`,
      values: [
        user.id, user.userAgent, result.browser.name, device, result.os.name, user.theme, user.source, user.ip, user.error
      ]})
  },
  getBrowserStats: async() => db.query(`WITH users_timestamp AS (
      SELECT userId, MAX(timestamp) AS timestamp
      FROM hits GROUP BY userId),
    users AS (
      SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.timestamp
      FROM hits, users_timestamp 
      WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
      ORDER BY hits.timestamp
    )
    SELECT browser, COUNT(DISTINCT userId) AS count FROM users GROUP BY browser`),
  getOSStats: async() => db.query(`WITH users_timestamp AS (
      SELECT userId, MAX(timestamp) AS timestamp
      FROM hits GROUP BY userId),
    users AS (
      SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.timestamp
      FROM hits, users_timestamp 
      WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
      ORDER BY hits.timestamp
      )
    SELECT os, count(DISTINCT userId) AS count FROM users GROUP BY os`),
  getDeviceStats: async() => db.query(`WITH users_timestamp AS (
      SELECT userId, MAX(timestamp) AS timestamp
      FROM hits GROUP BY userId),
    users AS (
      SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.timestamp
      FROM hits, users_timestamp 
      WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
      ORDER BY hits.timestamp
      )
    SELECT device, count(DISTINCT userId) AS count FROM users GROUP BY device`),
  getThemeStats: async() => db.query(`WITH users_timestamp AS (
      SELECT userId, MAX(timestamp) AS timestamp
      FROM hits GROUP BY userId),
    users AS (
      SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.timestamp
      FROM hits, users_timestamp 
      WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
      ORDER BY hits.timestamp
      )
    SELECT theme, count(DISTINCT userId) AS count FROM users GROUP BY theme`),
  getSourceStats: async() => db.query(`WITH users_timestamp AS (
      SELECT userId, MAX(timestamp) AS timestamp
      FROM hits GROUP BY userId),
    users AS (
      SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.timestamp
      FROM hits, users_timestamp 
      WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
      ORDER BY hits.timestamp
      )
    SELECT source, count(DISTINCT user) AS count FROM users GROUP BY source`),
  getUsers: async() => db.query(`WITH users_timestamp AS (
      SELECT userId, MAX(timestamp) AS timestamp
      FROM hits GROUP BY userId),
    users AS (
      SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.timestamp
      FROM hits, users_timestamp 
      WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
      ORDER BY hits.timestamp
      )
    SELECT * FROM users`),
  getTotalDailyHits: async() => db.query(`SELECT timestamp::date AS date, count(*) AS count 
    FROM hits GROUP BY date`),
  getUniqueDailyHits: async() => db.query(`SELECT timestamp::date AS date, count(DISTINCT userId) AS count 
    FROM hits GROUP BY date`)
}
module.exports = PostgresAnalyticsHandler
