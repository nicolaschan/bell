const Promise = require('bluebird')
const request = Promise.promisifyAll(require('request'))
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const logger = require('loggy')
const cache = require('./cache')

const dataDir = path.join(__dirname, '..', 'schedules')

/**
 * Make sure people aren't trying anything funny
 * with weird source characters
 *
 * @param  {string} source Source string
 * @return {boolean} Returns true if source is valid
 */
const validateSource = function (source) {
  return source.match(/^[a-zA-Z0-9]+$/)
}

const getLocalData = async function (source, file) {
  if (!validateSource(source)) { throw new Error('Source contains invalid characters') }
  const data = await fs.readFileAsync(path.join(dataDir, source, file))
  return data.toString()
}

const getWebData = async function (source, file, url) {
  if (!validateSource(source)) { throw new Error('Source contains invalid characters') }
  const response = await request.getAsync(`${url}/api/data/${source}/${file.split('.')[0]}`)
  return response.body
}

const fetch = async function (source, file) {
  const sourceData = await getSource(source)
  switch (sourceData.location) {
    case 'local':
      return getLocalData(source, file)
    case 'web':
      try {
        return (await getWebData(source, file, sourceData.url))
      } catch (e) {
        logger.warn(`Connection to ${sourceData.url} failed`)
        return getLocalData(source, file)
      }
  }
}
const getCorrection = cache(async function (source) {
  return fetch(source, 'correction.txt')
})
const getSchedules = cache(async function (source) {
  return fetch(source, 'schedules.bell')
})
const getCalendar = cache(async function (source) {
  return fetch(source, 'calendar.bell')
})
const getMeta = cache(async function (source) {
  const meta = await fetch(source, 'meta.json')
  return JSON.parse(meta)
})
const getSource = cache(async function (source) {
  source = await getLocalData(source, 'source.json')
  return JSON.parse(source.toString())
})
const getMessage = cache(async function (source) {
  try {
    return JSON.parse(await fetch(source, 'message.json'))
  } catch (e) {
    return JSON.parse(await fs.readFileAsync(path.join(dataDir, 'message.json')))
  }
})
const getVersion = cache(async function () {
  const version = await fs.readFileAsync(path.join(__dirname, '..', 'package.json'))
  return JSON.parse(version.toString()).version
})

module.exports = {
  getCorrection,
  getSchedules,
  getCalendar,
  getMeta,
  getSource,
  getMessage,
  getVersion
}
