const ConstantTiming = require('./timings/ConstantTiming').default
const BasicLightAndDarkTheme = require('./templates/BasicLightAndDarkTheme')

module.exports = BasicLightAndDarkTheme(
  'Rainbow',
  ConstantTiming(2),
  ['magenta', 'cyan', 'lime', 'yellow', 'orange', 'red'])
