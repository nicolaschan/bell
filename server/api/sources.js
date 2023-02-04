const Promise = require('bluebird')
const express = require('express')
const router = express.Router()
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const data = require('../data')

const schoolsDir = path.join(__dirname, '..', '..', 'schedules')

/**
 * Get the names of the supported schools
 * @return {Array<string>} short names (IDs) of schools
 */
const dataDirectories = async () => {
  const contents = await fs.readdirAsync(schoolsDir)
  return contents.filter(name =>
    fs.lstatSync(path.join(schoolsDir, name)).isDirectory())
}

router.get('/', async (req, res) => {
  const directories = await dataDirectories()
  const sources = await Promise.all(directories.map(async directory => {
    if (directory.startsWith('_')) return null
    try {
      const source = await data.getMeta(directory)
      source.id = directory
      return source
    } catch (e) {
      return null
    }
  }))
  res.json(sources.filter(x => x))
})

router.get('/names', async (req, res) => {
  res.json(await dataDirectories())
})

module.exports = router
