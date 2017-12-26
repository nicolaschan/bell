const BasicLightAndDarkTheme = require('./templates/BasicLightAndDarkTheme')
const BasicTiming = require('./timings/BasicTiming')

module.exports = BasicLightAndDarkTheme(
  'Blues',
  BasicTiming,
  ['#002db3', '#0066ff', '#33ccff', '#ccffff'])
