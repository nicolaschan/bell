// Gets a list of all the cities that we get hits from

const config = require('../config.json')
const { Client } = require('pg')
const db = new Client(config.postgres)

const geoip = require('geoip-database')
const maxmind = require('maxmind')
const cityLookup = maxmind.openSync(geoip.city)

const ProgressBar = require('Progress')

// var places = [];

// welcome to callback hell
var main = async function () {
  var run = async function(res) {
    console.log('Beginning insertion')
    const bar = new ProgressBar('eta :eta, completed :current/:total [:bar]', { total: res.rowCount })
    return Promise.all(res.rows.map(async row => {
      try {
        const ipTokens = row.ip.split(',')
        var ip;
        if (ipTokens.length == 1 || ipTokens.length == 2) {
          ip = ipTokens[0]
        } else if (ipTokens.length == 3) {
          ip = ipTokens[1]
        } else {
          return
        }
        const loc = cityLookup.get(ip)
        if (loc == null) {
          console.log('Location is null: ' + ip)
          return
        }
        const city = loc.city ? loc.city.names.en : 'Unknown'
        const region = loc.subdivisions ? loc.subdivisions[0].iso_code : 'Unknown'
        const country = loc.country ? loc.country.iso_code : 'Unknown'
        var result = await db.query(
            {
              text: `INSERT INTO locations (id, userid, city, region, country, lat, long, ip)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              values: [row.id, row.userid, city, region, country,
                       loc.location.latitude, loc.location.longitude, ip]
            })
        bar.tick()
        return result
      } catch (e) {
        bar.tick()
        console.log(e)
      } finally {
        return
      }
    }))
  }
  await db.connect()
    .then(res => db.query(`CREATE TABLE IF NOT EXISTS locations(id INTEGER, userid TEXT, city TEXT,
      region TEXT, country TEXT, lat REAL, long REAL, ip TEXT)`))
    // .then(res => db.query('SELECT ip, userid, id FROM hits ORDER BY id LIMIT 20'))
    .then(res => db.query(
      `WITH existing AS (SELECT MAX(id) AS n FROM locations)
        SELECT ip, userid, id FROM hits WHERE id > (SELECT n FROM existing) ORDER BY id`))
    .then(res => run(res))
    .catch(e => console.log(e))
}

main().then(res => {
  db.end().catch(e => console.log(e))
  console.log('Done')
})