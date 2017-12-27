const Promise = require('bluebird')
const UAParser = require('ua-parser-js')
const sqlite3 = Promise.promisifyAll(require('sqlite3').verbose())
var db = new sqlite3.Database('analytics.sqlite')

const ServerAnalyticsHandler = {
  initialize: async() => {
    await db.runAsync('CREATE TABLE IF NOT EXISTS hits (user, userAgent, browser, device, os, theme, source, ip, timestamp DATETIME)')
    await db.runAsync('CREATE TABLE IF NOT EXISTS errors (user, userAgent, browser, device, os, theme, source, ip, error, timestamp DATETIME)')
  },
  recordError: async(data) => {
    var result = UAParser(data.userAgent)
    var device = (result.device.vendor && result.device.model) ? `${result.device.vendor} ${result.device.model}` : 'unknown device'
    return db.runAsync('INSERT INTO errors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))',
      data.id, data.userAgent, result.browser.name, device, result.os.name,
      data.theme, data.source, data.ip, data.error)
  },
  recordHit: async(user) => {
    var result = UAParser(user.userAgent)
    var device = (result.device.vendor && result.device.model) ? `${result.device.vendor} ${result.device.model}` : 'unknown device'
    return db.runAsync('INSERT INTO hits VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))',
            user.id, user.userAgent, result.browser.name, device, result.os.name,
            user.theme, user.source, user.ip)
  },
  getBrowserStats: async() => {
    var rows = await db.allAsync('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT browser, count(DISTINCT user) AS count FROM users GROUP BY browser')
    return { rows: rows }
  },
  getOSStats: async() => {
    var rows = await db.allAsync('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT os, count(DISTINCT user) AS count FROM users GROUP BY os')
    return { rows: rows }
  },
  getDeviceStats: async() => {
    var rows = await db.allAsync('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT device, count(DISTINCT user) AS count FROM users GROUP BY device')
    return { rows: rows }
  },
  getThemeStats: async() => {
    var rows = await db.allAsync('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT theme, count(DISTINCT user) AS count FROM users GROUP BY theme')
    return { rows: rows }
  },
  getSourceStats: async() => {
    var rows = await db.allAsync('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT source, count(DISTINCT user) AS count FROM users GROUP BY source')
    return { rows: rows }
  },
  getUsers: async() => {
    var rows = await db.allAsync('SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)')
    return { rows: rows }
  },
  getTotalDailyHits: async() => {
    var rows = await db.allAsync('SELECT DATE(timestamp, "localtime") AS date, count(*) AS count FROM hits GROUP BY date')
    return { rows: rows }
  },
  getUniqueDailyHits: async() => {
    var rows = await db.allAsync('SELECT DATE(timestamp, "localtime") AS date, count(DISTINCT user) AS count FROM hits GROUP BY date')
    return { rows: rows }
  } }
module.exports = ServerAnalyticsHandler
