const UAParser = require('ua-parser-js')
const Database = require('better-sqlite3')
const db = new Database('analytics.sqlite')

const ServerAnalyticsHandler = {
  initialize: async() => {
    db.prepare('CREATE TABLE IF NOT EXISTS hits (user, userAgent, browser, device, os, theme, source, ip, timestamp DATETIME)').run()
    db.prepare('CREATE TABLE IF NOT EXISTS errors (user, userAgent, browser, device, os, theme, source, ip, error, timestamp DATETIME)').run()
  },
  recordError: async(data) => {
    var result = UAParser(data.userAgent)
    var device = (result.device.vendor && result.device.model) ? `${result.device.vendor} ${result.device.model}` : 'unknown device'
    return db.prepare('INSERT INTO errors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))').run(
      data.id, data.userAgent, result.browser.name, device, result.os.name,
      data.theme, data.source, data.ip, data.error)
  },
  recordHit: async(user) => {
    var result = UAParser(user.userAgent)
    var device = (result.device.vendor && result.device.model) ? `${result.device.vendor} ${result.device.model}` : 'unknown device'
    return db.prepare('INSERT INTO hits VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))').run(
            user.id, user.userAgent, result.browser.name, device, result.os.name,
            user.theme, user.source, user.ip)
  },
  getBrowserStats: async() => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT browser, count(DISTINCT user) AS count FROM users GROUP BY browser').all()
    return { rows: rows }
  },
  getOSStats: async() => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT os, count(DISTINCT user) AS count FROM users GROUP BY os').all()
    return { rows: rows }
  },
  getDeviceStats: async() => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT device, count(DISTINCT user) AS count FROM users GROUP BY device').all()
    return { rows: rows }
  },
  getThemeStats: async() => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT theme, count(DISTINCT user) AS count FROM users GROUP BY theme').all()
    return { rows: rows }
  },
  getSourceStats: async() => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT source, count(DISTINCT user) AS count FROM users GROUP BY source').all()
    return { rows: rows }
  },
  getUsers: async() => {
    var rows = db.prepare('SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)').all()
    return { rows: rows }
  },
  getTotalDailyHits: async() => {
    var rows = db.prepare('SELECT DATE(timestamp, "localtime") AS date, count(*) AS count FROM hits GROUP BY date').all()
    return { rows: rows }
  },
  getUniqueDailyHits: async() => {
    var rows = db.prepare('SELECT DATE(timestamp, "localtime") AS date, count(DISTINCT user) AS count FROM hits GROUP BY date').all()
    return { rows: rows }
  } }
module.exports = ServerAnalyticsHandler
