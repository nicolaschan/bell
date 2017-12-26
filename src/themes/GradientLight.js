const BasicColorTheme = require('./templates/BasicColorTheme')
const ColorSchemeTransformations = require('./ColorSchemeTransformations')
const BasicTiming = require('./timings/BasicTiming')

module.exports = {
  name: 'Gradient - Light',
  theme: BasicColorTheme(
    ColorSchemeTransformations.fromColorLight,
    BasicTiming,
    [{
      'background': 'linear-gradient(to bottom right, orange, red)'
    }, {
      'background': 'linear-gradient(to bottom right, yellow, orange)'
    }, {
      'background': 'linear-gradient(to bottom right, lime, yellow)'
    }, {
      'background': 'linear-gradient(to bottom right, cyan, lime)'
    }],
    {
      weekend: {
        'background': 'linear-gradient(to bottom right, magenta, cyan)'
      },
      holiday: {
        'background': 'linear-gradient(to bottom right, cyan, magenta)'
      }
    }
  )
}
