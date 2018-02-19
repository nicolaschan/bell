const UAParser = require('useragent')
const Database = require('better-sqlite3')
const db = new Database('analytics.sqlite')

var getDevice = function (result) {
  return (result.device.family || (result.device.vendor && result.device.model))
    ? (result.device.family || `${result.device.vendor} ${result.device.model}`)
    : 'Other'
}

var runSafe = function (table, alter) {
  try {
    db.prepare(alter).run()
  } catch (e) {
    // Table does not need altering
  }
}

const ServerAnalyticsHandler = {
  initialize: async () => {
    db.prepare('CREATE TABLE IF NOT EXISTS hits (user, userAgent, browser, device, os, theme, source, ip, version, timestamp DATETIME)').run()
    db.prepare('CREATE TABLE IF NOT EXISTS errors (user, userAgent, browser, device, os, theme, source, ip, error, version, timestamp DATETIME)').run()
    db.prepare('CREATE TABLE IF NOT EXISTS servers (user, ip, version, platform, release, type, arch, node, timestamp DATETIME)').run()

    // Add version column if there isn't one (for legacy support)
    ServerAnalyticsHandler.addVersionColumnIfNotExists()
  },
  addVersionColumnIfNotExists: async () => {
    runSafe('hits', 'ALTER TABLE hits ADD COLUMN version')
    runSafe('errors', 'ALTER TABLE errors ADD COLUMN version')
  },
  recordError: async (data) => {
    var result = UAParser.parse(data.userAgent)
    var device = getDevice(result)
    return db.prepare(`INSERT INTO errors (user, userAgent, browser, device, os, theme, source, ip, error, version, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))`).run(
      data.id, data.userAgent, result.family, device, result.os.family,
      data.theme, data.source, data.ip, data.error, data.version)
  },
  recordServer: async (data) => {
    return db.prepare(`INSERT INTO servers (user, ip, version, platform, release, type, arch, node, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))`).run(
      data.id, data.ip, data.version, data.os.platform, data.os.release, data.os.type, data.os.arch, data.node)
  },
  recordHit: async (user) => {
    var result = UAParser.parse(user.userAgent)
    var device = getDevice(result)
    return db.prepare(`INSERT INTO hits (user, userAgent, browser, device, os, theme, source, ip, version, timestamp) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))`).run(
      user.id, user.userAgent, result.family, device, result.os.family,
      user.theme, user.source, user.ip, user.version)
  },
  getBrowserStats: async () => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, version, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT browser, count(DISTINCT user) AS count FROM users GROUP BY browser').all()
    return { rows: rows }
  },
  getOSStats: async () => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, version, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT os, count(DISTINCT user) AS count FROM users GROUP BY os').all()
    return { rows: rows }
  },
  getDeviceStats: async () => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, version, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT device, count(DISTINCT user) AS count FROM users GROUP BY device').all()
    return { rows: rows }
  },
  getThemeStats: async () => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, version, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT theme, count(DISTINCT user) AS count FROM users GROUP BY theme').all()
    return { rows: rows }
  },
  getSourceStats: async () => {
    var rows = db.prepare('WITH users AS (SELECT user, userAgent, browser, device, os, theme, source, ip, version, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)) SELECT source, count(DISTINCT user) AS count FROM users GROUP BY source').all()
    return { rows: rows }
  },
  getUsers: async () => {
    var rows = db.prepare('SELECT user, userAgent, browser, device, os, theme, source, ip, version, timestamp FROM hits GROUP BY user HAVING timestamp = MAX(timestamp)').all()
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
