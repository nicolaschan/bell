const BasicColorTheme = require('./templates/BasicColorTheme')
const ColorSchemeTransformations = require('./ColorSchemeTransformations')
const BasicTiming = require('./timings/BasicTiming')

module.exports = {
  name: 'Secret: Jonathan',
  enabled: () => false,
  theme: BasicColorTheme(
    ColorSchemeTransformations.fromObjectStrings,
    BasicTiming,
    [{
      background: {
        'background-image': 'url(\'../img/jonathan-1.png\')',
        'background-size': '300%'
      },
      text: 'red',
      subtext: 'white',
      contrast: '#444'
    }, {
      background: {
        'background-image': 'url(\'../img/jonathan-1.png\')',
        'background-size': '233%'
      },
      text: 'orange',
      subtext: 'white',
      contrast: '#444'
    }, {
      background: {
        'background-image': 'url(\'../img/jonathan-1.png\')',
        'background-size': '166%'
      },
      text: 'yellow',
      subtext: 'white',
      contrast: '#444'
    }, {
      background: {
        'background-image': 'url(\'../img/jonathan-1.png\')',
        'background-size': '100%'
      },
      text: 'lime',
      subtext: 'white',
      contrast: '#444'
    }], {
      holiday: {
        background: {
          'background-image': 'url(\'../img/jonathan-1.png\')',
          'background-size': '100%'
        },
        text: 'magenta',
        subtext: 'white',
        contrast: '#444'
      },
      weekend: {
        background: {
          'background-image': 'url(\'../img/jonathan-1.png\')',
          'background-size': '100%'
        },
        text: 'cyan',
        subtext: 'white',
        contrast: '#444'
      }
    }
  )
}
