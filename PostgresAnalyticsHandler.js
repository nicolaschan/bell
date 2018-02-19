const UAParser = require('useragent')
const config = require('./config.json')

const {
  Client
} = require('pg')
const db = new Client(config.postgres)

var getDevice = function (result) {
  return (result.device.family || (result.device.vendor && result.device.model))
    ? (result.device.family || `${result.device.vendor} ${result.device.model}`)
    : 'Other'
}

const PostgresAnalyticsHandler = {
  initialize: async () => {
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
        version TEXT,
        timestamp TIMESTAMP WITH TIME ZONE
    )`)
    await db.query(`CREATE TABLE IF NOT EXISTS errors (
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
        version TEXT,
        timestamp TIMESTAMP WITH TIME ZONE
    )`)
    return db.query(`CREATE TABLE IF NOT EXISTS servers (
        id SERIAL,
        userId TEXT,
        ip TEXT,
        version TEXT,
        platform TEXT,
        release TEXT,
        type TEXT,
        arch TEXT,
        node TEXT,
        timestamp TIMESTAMP WITH TIME ZONE
    )`)
  },
  disconnect: async () => {
    return db.end()
  },
  recordHit: async (user) => {
    var result = UAParser.parse(user.userAgent)
    var device = getDevice(result)
    return db.query({
      text: `INSERT INTO hits (userId, userAgent, browser, device, os, theme, source, ip, version, timestamp) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TIMESTAMP 'now')`,
      values: [
        user.id, user.userAgent, result.family, device, result.os.family, user.theme, user.source, user.ip, user.version
      ]})
  },
  recordServer: async (user) => {
    return db.query({
      text: `INSERT INTO hits (userId, ip, version, timestamp) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TIMESTAMP 'now')`,
      values: [
        user.id, user.ip, user.version, user.os.platform, user.os.release, user.os.type, user.os.arch, user.node
      ]})
  },
  recordError: async (user) => {
    var result = UAParser.parse(user.userAgent)
    var device = getDevice(result)
    return db.query({
      text: `INSERT INTO errors (userId, userAgent, browser, device, os, theme, source, ip, error, version, timestamp) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TIMESTAMP 'now')`,
      values: [
        user.id, user.userAgent, result.family, device, result.os.family, user.theme, user.source, user.ip, user.error, user.version
      ]})
  },
  getBrowserStats: async () => db.query(`WITH users_timestamp AS (
      SELECT userId, MAX(timestamp) AS timestamp
      FROM hits GROUP BY userId),
    users AS (
      SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.version, hits.timestamp
      FROM hits, users_timestamp 
      WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
      ORDER BY hits.timestamp
    )
    SELECT browser, COUNT(DISTINCT userId) AS count FROM users GROUP BY browser`),
  getOSStats: async () => db.query(`WITH users_timestamp AS (
      SELECT userId, MAX(timestamp) AS timestamp
      FROM hits GROUP BY userId),
    users AS (
      SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.version, hits.timestamp
      FROM hits, users_timestamp 
      WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
      ORDER BY hits.timestamp
      )
    SELECT os, count(DISTINCT userId) AS count FROM users GROUP BY os`),
  getDeviceStats: async () => db.query(`WITH users_timestamp AS (
      SELECT userId, MAX(timestamp) AS timestamp
      FROM hits GROUP BY userId),
    users AS (
      SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.version, hits.timestamp
      FROM hits, users_timestamp 
      WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
      ORDER BY hits.timestamp
      )
    SELECT device, count(DISTINCT userId) AS count FROM users GROUP BY device`),
  getThemeStats: async () => db.query(`WITH users_timestamp AS (
      SELECT userId, MAX(timestamp) AS timestamp
      FROM hits GROUP BY userId),
    users AS (
      SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.version, hits.timestamp
      FROM hits, users_timestamp 
      WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
      ORDER BY hits.timestamp
      )
    SELECT theme, count(DISTINCT userId) AS count FROM users GROUP BY theme`),
  getSourceStats: async () => db.query(`WITH users_timestamp AS (
      SELECT userId, MAX(timestamp) AS timestamp
      FROM hits GROUP BY userId),
    users AS (
      SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.version, hits.timestamp
      FROM hits, users_timestamp 
      WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
      ORDER BY hits.timestamp
      )
    SELECT source, count(DISTINCT user) AS count FROM users GROUP BY source`),
  getUsers: async () => db.query(`WITH users_timestamp AS (
      SELECT userId, MAX(timestamp) AS timestamp
      FROM hits GROUP BY userId),
    users AS (
      SELECT hits.userId, hits.userAgent, hits.browser, hits.device, hits.os, hits.theme, hits.source, hits.ip, hits.version, hits.timestamp
      FROM hits, users_timestamp 
      WHERE hits.userId = users_timestamp.userId AND hits.timestamp = users_timestamp.timestamp
      ORDER BY hits.timestamp
      )
    SELECT * FROM users`),
  getTotalDailyHits: async () => db.query(`SELECT timestamp::date AS date, count(*) AS count 
    FROM hits GROUP BY date`),
  getUniqueDailyHits: async () => db.query(`SELECT timestamp::date AS date, count(DISTINCT userId) AS count 
    FROM hits GROUP BY date`)
}
module.exports = PostgresAnalyticsHandler
