// Gets a list of all the cities that we get hits from
require('dotenv-safe').config()

const config = {
  postgres: {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT
  }
}
const logger = require('loggy')

if (process.env.POSTGRES_ENABLED != 'true') {
  logger.error('Postgres is disabled')
  process.exit(1)
}

const { Pool } = require('pg')
const db = new Pool(config.postgres)

const geoip = require('geoip-database')
const maxmind = require('maxmind')
const cityLookup = maxmind.openSync(geoip.city)

const ProgressBar = require('progress')

var main = async function () {
  logger.log(`Connecting to postgres ${config.postgres.host}`)
  logger.log(`Ensuring table 'locations'`)
  await db.query(`CREATE TABLE IF NOT EXISTS locations(id INTEGER, userid TEXT, city TEXT,
      region TEXT, country TEXT, lat REAL, long REAL, ip TEXT)`)

  var locationsCount = parseInt((await db.query('SELECT COUNT(*) FROM locations')).rows[0].count)
  logger.info(`${locationsCount} locations already exist in table`)
  var hits
  logger.log('Querying for hits')
  if (locationsCount > 0) {
    hits = await db.query(`WITH existing AS (SELECT MAX(id) AS n FROM locations)
      SELECT ip, userid, id FROM hits WHERE id > (SELECT n FROM existing) ORDER BY id`)
  } else {
    hits = await db.query('SELECT ip, userid, id FROM hits')
  }
  logger.info(`Found ${hits.rowCount} hits`)

  const bar = new ProgressBar('eta :eta, completed :current/:total [:bar]', {
    total: hits.rowCount
  })
  const saveLocation = async function (hit) {
    try {
      const ipTokens = hit.ip.split(',')
      var ip
      if (ipTokens.length === 1 || ipTokens.length === 2) {
        ip = ipTokens[0]
      } else if (ipTokens.length === 3) {
        ip = ipTokens[1]
      } else {
        return
      }
      const loc = cityLookup.get(ip)
      if (loc == null) {
        logger.warn('Location is null: ' + ip)
        return
      }
      const city = loc.city ? loc.city.names.en : 'Unknown'
      const region = loc.subdivisions ? loc.subdivisions[0].iso_code : 'Unknown'
      const country = loc.country ? loc.country.iso_code : 'Unknown'
      await db.query({
        text: `INSERT INTO locations (id, userid, city, region, country, lat, long, ip)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        values: [hit.id, hit.userid, city, region, country,
          loc.location.latitude, loc.location.longitude, ip]
      })
      return bar.tick()
    } catch (e) {
      logger.error(e)
      return bar.tick()
    }
  }

  logger.log('Beginning insertion')
  for (const row of hits.rows) {
    await saveLocation(row)
  }
  await db.end()
}
main()
  .then(() => logger.success('Done'))
  .catch(e => logger.error(e))
