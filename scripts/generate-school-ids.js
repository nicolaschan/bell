const fs = require('fs')
const path = require('path')

const projectDirectory = path.join(__dirname, '..')
const schedulesDirectory = path.join(projectDirectory, 'schedules')
const outputFile = path.join(projectDirectory, 'server', 'school-ids.json')
const retiredSchoolIDs = new Set(['vams8'])

const hasRequiredLocalFiles = entry => [
  'meta.json',
  'correction.txt',
  'calendar.bell',
  'schedules.bell'
].every(file => fs.existsSync(path.join(schedulesDirectory, entry.name, file)))

const isPublicSchool = entry => {
  const directory = path.join(schedulesDirectory, entry.name)
  const sourceFile = path.join(directory, 'source.json')
  const metaFile = path.join(directory, 'meta.json')
  if (!fs.existsSync(sourceFile)) return false

  const source = JSON.parse(fs.readFileSync(sourceFile, 'utf8'))
  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : null
  if ((meta && meta.type === 'custom') || source.location === 'redirect' || retiredSchoolIDs.has(entry.name)) return false
  if (source.location === 'local') return hasRequiredLocalFiles(entry)
  return source.location === 'web' && typeof source.url === 'string'
}

const schoolIDs = fs.readdirSync(schedulesDirectory, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.') && isPublicSchool(entry))
  .map(entry => entry.name)
  .sort((left, right) => left.localeCompare(right))

if (schoolIDs.length < 100) {
  throw new Error(`Only found ${schoolIDs.length} schools; refusing to write an incomplete directory.`)
}

fs.writeFileSync(outputFile, `${JSON.stringify(schoolIDs, null, 2)}\n`)
console.log(`Wrote ${schoolIDs.length} school IDs to ${path.relative(projectDirectory, outputFile)}.`)
