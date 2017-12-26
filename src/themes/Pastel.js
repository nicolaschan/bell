const BasicLightAndDarkTheme = require('./templates/BasicLightAndDarkTheme')
const BasicTiming = require('./timings/BasicTiming')

module.exports = BasicLightAndDarkTheme(
  'Pastel',
  BasicTiming,
  ['#ffbfd1', '#ffcfa5', '#fff9b0', '#bcffae'],
  {
    weekend: '#b3ffff',
    holiday: '#ff9bff'
  })
