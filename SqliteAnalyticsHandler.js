const UAParser = require('useragent')
const Database = require('better-sqlite3')
const db = new Database('analytics.sqlite')

var getDevice = function (result) {
  return (result.device.family || (result.device.vendor && result.device.model))
    ? (result.device.family || `${result.device.vendor} ${result.device.model}`)
    : 'Other'
}

const ServerAnalyticsHandler = {
  initialize: async () => {
    db.prepare('CREATE TABLE IF NOT EXISTS hits (user, userAgent, browser, device, os, theme, source, ip, timestamp DATETIME)').run()
    db.prepare('CREATE TABLE IF NOT EXISTS errors (user, userAgent, browser, device, os, theme, source, ip, error, timestamp DATETIME)').run()
  },
  recordError: async (data) => {
    var result = UAParser.parse(data.userAgent)
    var device = getDevice(result)
    return db.prepare('INSERT INTO errors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))').run(
      data.id, data.userAgent, result.family, device, result.os.family,
      data.theme, data.source, data.ip, data.error)
  },
  recordHit: async (user) => {
    var result = UAParser.parse(user.userAgent)
    var device = getDevice(result)
    return db.prepare('INSERT INTO hits VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))').run(
      user.id, user.userAgent, result.family, device, result.os.family,
      user.theme, user.source, user.ip)
  },
  getBrowserStats: async () => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT browser, count(DISTINCT user) AS count FROM users GROUP BY browser').all()
    return { rows: rows }
  },
  getOSStats: async () => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT os, count(DISTINCT user) AS count FROM users GROUP BY os').all()
    return { rows: rows }
  },
  getDeviceStats: async () => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT device, count(DISTINCT user) AS count FROM users GROUP BY device').all()
    return { rows: rows }
  },
  getThemeStats: async () => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT theme, count(DISTINCT user) AS count FROM users GROUP BY theme').all()
    return { rows: rows }
  },
  getSourceStats: async () => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT source, count(DISTINCT user) AS count FROM users GROUP BY source').all()
    return { rows: rows }
  },
  getUsers: async () => {
    var rows = db.prepare('SELECT user, userAgent, browser, device, os, theme, source, ip, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)').all()
    return { rows: rows }
  },
  getTotalDailyHits: async () => {
    var rows = db.prepare('SELECT DATE(timestamp, "localtime") AS date, count(*) AS count FROM hits GROUP BY date').all()
    return { rows: rows }
  },
  getUniqueDailyHits: async () => {
    var rows = db.prepare('SELECT DATE(timestamp, "localtime") AS date, count(DISTINCT user) AS count FROM hits GROUP BY date').all()
    return { rows: rows }
  } }
module.exports = ServerAnalyticsHandler
