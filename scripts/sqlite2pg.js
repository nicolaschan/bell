const UAParser = require('useragent')
const config = require('../config.json')
const { Client } = require('pg')
const pgDb = new Client(config.postgres)
const Database = require('better-sqlite3')
const sqliteDb = new Database('../analytics.sqlite')

const pgHandler = require('../PostgresAnalyticsHandler.js')

// Migrates sqlite database to postgres, in the process re-parsing the useragent string

var getDevice = function (result) {
  return (result.device.family || (result.device.vendor && result.device.model))
    ? (result.device.family || `${result.device.vendor} ${result.device.model}`)
    : 'Other'
}

var recordHit = async function (row) {
  var user = row.user
  var uaStr = row.userAgent
  var theme = row.theme
  var source = row.source
  var ip = row.ip
  var timestamp = row.timestamp
  var result = UAParser.parse(uaStr)
  var device = getDevice(result)
  console.log(user, result.family, device, result.os.family, theme, source, ip, timestamp)
  return pgDb.query({
    text: `INSERT INTO hits (userId, userAgent, browser, device, os, theme, source, ip, timestamp) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    values: [
      user, uaStr, result.family, device, result.os.family, theme, source, ip, timestamp
    ]})
}

var recordError = async function (row) {
  var user = row.user
  var uaStr = row.userAgent
  var theme = row.theme
  var source = row.source
  var ip = row.ip
  var timestamp = row.timestamp
  var error = row.error
  var result = UAParser.parse(uaStr)
  var device = getDevice(result)
  console.log(user, result.family, device, result.os.family, theme, source, ip, error, timestamp)
  return pgDb.query({
    text: `INSERT INTO errors (userId, userAgent, browser, device, os, theme, source, ip, error, timestamp) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    values: [
      user, uaStr, result.family, device, result.os.family, theme, source, ip, error, timestamp
    ]})
}

var migrateHits = async function () {
  var sqliteHits = sqliteDb.prepare('SELECT * FROM hits ORDER BY rowid')
  console.log('Migrating hits...')
  for (let row of sqliteHits.iterate()) {
    await recordHit(row)
  }
}

var migrateErrors = async function () {
  var sqliteErrors = sqliteDb.prepare('SELECT * FROM errors ORDER BY rowid')
  console.log('Migrating errors...')
  for (let row of sqliteErrors.iterate()) {
    await recordError(row)
  }
}

pgDb.connect()
pgHandler.initialize().then(migrateHits).then(migrateErrors).then(async () => pgDb.end()).then(pgHandler.disconnect)
