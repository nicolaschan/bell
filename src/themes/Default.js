const BasicLightAndDarkTheme = require('./templates/BasicLightAndDarkTheme')
const BasicTiming = require('./timings/BasicTiming')

module.exports = BasicLightAndDarkTheme(
  'Default',
  BasicTiming,
  ['red', 'orange', 'yellow', 'lime'],
  {
    weekend: 'cyan',
    holiday: 'magenta'
  })
