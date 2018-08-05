const Promise = require('bluebird')
const request = Promise.promisifyAll(require('request'))
const logger = require('loggy')
const compareVersions = require('compare-versions')

const data = require('./data')

let newestVersion
const getNewestVersion = async function () {
  try {
    const version = await request.getAsync('https://countdown.zone/api/version')
    return version.body
  } catch (e) {
    // Failed to check for a new version
    throw new Error('Failed to check for a new version')
  }
}
const alertAboutVersionChange = function (localVersion, remoteVersion) {
  const comparison = compareVersions(localVersion, remoteVersion)

  if (comparison > 0) {
    // Local version is greater than the remote version
    logger.info(`This is future version bell-countdown@${localVersion} (countdown.zone is ${remoteVersion})`)
  } else if (comparison < 0) {
    // Local version is less than the remote version
    logger.warn('There is a new version of bell-countdown available')
    logger.warn(`You are using ${localVersion} while the newest version available is ${remoteVersion}`)
    logger.warn('Please update by visiting https://countdown.zone/gh')
  } else {
    // Local version matches remote version
    logger.info(`bell-countdown@${localVersion} is up to date`)
  }
}

const checkForNewVersion = async function () {
  try {
    const version = await getNewestVersion()
    if (version !== newestVersion) {
      newestVersion = version
      alertAboutVersionChange(await data.getVersion(), newestVersion)
    }
  } catch (e) {
    logger.warn('Check for new version failed — check your internet connection')
    logger.warn(e)
  }
}

module.exports = checkForNewVersion
