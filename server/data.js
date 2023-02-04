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
  return source.match(/^[a-zA-Z0-9-]+$/)
}

const getLocalData = async function (source, file) {
  if (!validateSource(source)) { throw new Error('Source contains invalid characters') }
  return getLocalDataUnvalidated(source, file)
}

const getLocalDataUnvalidated = async function (source, file) {
  const data = await fs.readFileAsync(path.join(dataDir, source, file))
  return data.toString()
}

const getWebData = async function (source, file, url) {
  if (!validateSource(source)) { throw new Error('Source contains invalid characters') }
  const path = file == null ? `${url}/${source}` : `${url}/${source}/${file.split('.')[0]}`
  const response = await request.getAsync(path)
  if (response.statusCode === 404) {
    throw new Error('Not found')
  }
  if (response.statusCode !== 200) {
    throw new Error('Invalid status code')
  }
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
        if (e.message !== 'Not found') {
          logger.warn(`Connection to ${sourceData.url} failed`)
        }
        return getLocalData(source, file)
      }
  }
}

const getCorrection = async function (source) {
  return fetch(source, 'correction.txt')
}
const getSchedules = async function (source) {
  return fetch(source, 'schedules.bell')
}
const getCalendar = async function (source) {
  return fetch(source, 'calendar.bell')
}
const getMeta = async function (source) {
  try {
    const meta = await fetch(source, 'meta.json')
    return JSON.parse(meta)
  } catch (e) {
    return JSON.parse(await getLocalData(source, 'meta.json'))
  }
}
const getSource = async function (source) {
  try {
    source = await getLocalData(source, 'source.json')
  } catch (e) {
    source = await getLocalDataUnvalidated('_default', 'source.json')
  }
  return JSON.parse(source.toString())
}
const getMessage = async function (source) {
  try {
    return JSON.parse(await fetch(source, 'message.json'))
  } catch (e) {
    return JSON.parse(await fs.readFileAsync(path.join(dataDir, 'message.json')))
  }
}
const getVersion = cache(async function () {
  const version = await fs.readFileAsync(path.join(__dirname, '..', 'package.json'))
  return JSON.parse(version.toString()).version
}, 60 * 60 * 24)

const getAll = async function (source) {
  const sourceData = await getSource(source)
  if (sourceData.location === 'web') {
    return JSON.parse(await getWebData(source, null, sourceData.url))
  }

  const [meta, correction, calendar, schedules, message] = await Promise.all([
    getMeta(source),
    getCorrection(source),
    getCalendar(source),
    getSchedules(source),
    getMessage(source)
  ])

  return {
    meta, correction, calendar, schedules, message
  }
}

module.exports = {
  getCorrection,
  getSchedules,
  getCalendar,
  getMeta,
  getSource,
  getMessage,
  getVersion,
  getAll
}
