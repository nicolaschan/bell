const Promise = require('bluebird')
const request = Promise.promisifyAll(require('request'))
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const cache = require('./cache')

const schedulesRepositoryURL = 'https://raw.githubusercontent.com/amah853/schedules/master'
const editorScheduleProxyURL = 'https://iosbell-api.ahmadmahrous853.workers.dev/config/schedule-source'

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

const sourceLinkPattern = /^\.\.\/([a-zA-Z0-9-]+)\/source\.json$/

const getLocalData = async function (source, file) {
  if (!validateSource(source)) { throw new Error('Source contains invalid characters') }
  return getLocalDataUnvalidated(source, file)
}

const getRepositoryData = async function (source, file) {
  if ((source && !validateSource(source)) || !file.match(/^[a-zA-Z0-9._-]+$/)) {
    throw new Error('Invalid schedules repository path')
  }

  const response = await request.getAsync({
    url: `${schedulesRepositoryURL}/${source ? `${source}/` : ''}${file}`,
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    }
  })
  if (response.statusCode !== 200) {
    throw new Error(response.statusCode === 404 ? 'Not found' : 'Invalid status code')
  }
  return response.body
}

const getLocalDataUnvalidated = async function (source, file) {
  return getRepositoryData(source, file)
}

const getWebData = async function (source, file, url) {
  if (!validateSource(source)) { throw new Error('Source contains invalid characters') }
  if (url === 'https://edit.bell.plus/api/data/schools') {
    url = editorScheduleProxyURL
  }
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

const resolveSource = async function (source, visited = []) {
  if (!validateSource(source)) { throw new Error('Source contains invalid characters') }
  if (visited.includes(source)) { throw new Error('Circular source reference') }

  let rawSource
  try {
    rawSource = await getLocalData(source, 'source.json')
  } catch (e) {
    rawSource = await getLocalDataUnvalidated('_default', 'source.json')
  }

  const sourceText = rawSource.toString().trim()
  const linkMatch = sourceText.match(sourceLinkPattern)
  if (linkMatch) {
    return resolveSource(linkMatch[1], [...visited, source])
  }

  return { source, sourceData: JSON.parse(sourceText) }
}

const fetch = async function (source, file) {
  const resolved = await resolveSource(source)
  const resolvedSource = resolved.source
  const sourceData = resolved.sourceData
  switch (sourceData.location) {
    case 'local':
      return getLocalData(resolvedSource, file)
    case 'web':
      try {
        return (await getWebData(resolvedSource, file, sourceData.url))
      } catch (e) {
        if (e.message !== 'Not found') {
          console.warn(`Connection to ${sourceData.url} failed`)
        }
        return getLocalData(resolvedSource, file)
      }
  }
}

const getRedirect = async function (source) {
  const { sourceData } = await resolveSource(source)
  if (sourceData.location === 'redirect') {
    return sourceData.to
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
  return (await resolveSource(source)).sourceData
}
const getMessage = async function (source) {
  try {
    return JSON.parse(await fetch(source, 'message.json'))
  } catch (e) {
    return JSON.parse(await getLocalDataUnvalidated('', 'message.json'))
  }
}
const getVersion = cache(async function () {
  const version = await fs.readFileAsync(path.join(__dirname, '..', 'package.json'))
  return JSON.parse(version.toString()).version
}, 60 * 60 * 24)

const getAll = async function (source) {
  const resolved = await resolveSource(source)
  const resolvedSource = resolved.source
  const sourceData = resolved.sourceData
  if (sourceData.location === 'redirect') {
    return getAll(sourceData.to)
  }
  if (sourceData.location === 'web') {
    return JSON.parse(await getWebData(resolvedSource, null, sourceData.url))
  }

  const [meta, correction, calendar, schedules, message] = await Promise.all([
    getMeta(resolvedSource),
    getCorrection(resolvedSource),
    getCalendar(resolvedSource),
    getSchedules(resolvedSource),
    getMessage(resolvedSource)
  ])

  return {
    meta, correction, calendar, schedules, message
  }
}

module.exports = {
  getRedirect,
  getCorrection,
  getSchedules,
  getCalendar,
  getMeta,
  getSource,
  getMessage,
  getVersion,
  getAll
}
