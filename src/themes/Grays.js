const BasicLightAndDarkTheme = require('./templates/BasicLightAndDarkTheme')
const BasicTiming = require('./timings/BasicTiming')

module.exports = BasicLightAndDarkTheme(
  'Grays',
  BasicTiming,
  ['white', 'lightgray', 'silver', 'darkgray'])
