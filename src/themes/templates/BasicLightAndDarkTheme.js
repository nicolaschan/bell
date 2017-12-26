const BasicColorTheme = require('./BasicColorTheme')
const ColorSchemeTransformations = require('../ColorSchemeTransformations')

module.exports = function (name, timing, colors, special = {}) {
  return {
    light: {
      name: `${name} - Light`,
      theme: BasicColorTheme(ColorSchemeTransformations.fromColorLight, timing, colors, special)
    },
    dark: {
      name: `${name} - Dark`,
      theme: BasicColorTheme(ColorSchemeTransformations.fromColorDark, timing, colors, special)
    }
  }
}
