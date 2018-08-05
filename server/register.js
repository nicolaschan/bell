const Promise = require('bluebird')
const request = Promise.promisifyAll(require('request'))
const os = require('os')
const uuid = require('uuid')
const fs = require('fs')
const path = require('path')
const data = require('./data')

const getServerId = async function () {
  const idFile = path.join(__dirname, '..', 'id.txt')
  try {
    const id = await fs.readFileAsync(idFile)
    return id
  } catch (e) {
    const newId = uuid()
    await fs.writeFileAsync(idFile, newId)
    return newId
  }
}

function register (url) {
  return async function () {
    const serverId = await getServerId()
    try {
      await request.postAsync(url, {
        json: true,
        form: {
          id: serverId,
          os: {
            platform: os.platform(),
            release: os.release(),
            type: os.type(),
            arch: os.arch()
          },
          node: process.version,
          version: await data.getVersion()
        }
      })
    } catch (e) {
      // do nothing
    }
  }
}

module.exports = {
  registerServer: register('https://countdown.zone/api/stats/server'),
  registerApi: register('https://countdown.zone/api/stats/api')
}
