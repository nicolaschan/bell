const BasicColorTheme = require('./templates/BasicColorTheme')
const ColorSchemeTransformations = require('./ColorSchemeTransformations')
const BasicTiming = require('./timings/BasicTiming')

module.exports = {
  name: 'Halloween',
  enabled: () => {
    const now = new Date()
    return (now.getMonth() + 1) == 10 && (now.getDate() > 18)
  },
  theme: BasicColorTheme(
    ColorSchemeTransformations.fromObjectStrings,
    BasicTiming,
    [{
      background: {
        'background-image': 'url(\'../img/halloween.svg\')',
        'background-size': '100%',
        'background-repeat': 'no-repeat',
        'background-color': 'black'
      },
      text: '#8A0707',
      subtext: '#8A0707',
      contrast: '#444'
    }, {
      background: {
        'background-image': 'url(\'../img/halloween.svg\')',
        'background-size': '100%',
        'background-repeat': 'no-repeat',
        'background-color': '#8A0707'
      },
      text: '#F27D14',
      subtext: '#F27D14',
      contrast: '#444'
    }, {
      background: {
        'background-image': 'url(\'../img/halloween.svg\')',
        'background-size': '100%',
        'background-repeat': 'no-repeat',
        'background-color': '#bf3305'
      },
      text: '#FED85B',
      subtext: '#FED85B',
      contrast: '#444'
    }, {
      background: {
        'background-image': 'url(\'../img/halloween.svg\')',
        'background-size': '100%',
        'background-repeat': 'no-repeat',
        'background-color': '#d3581b'
      },
      text: '#FED85B',
      subtext: '#FED85B',
      contrast: '#444'
    }], {
      holiday: {
        background: {
          'background-image': 'url(\'../img/halloween.svg\')',
          'background-size': '100%',
          'background-repeat': 'no-repeat',
          'background-color': '#d3581b'
        },
        text: '#FED85B',
        subtext: '#FED85B',
        contrast: '#444'
      },
      weekend: {
        background: {
          'background-image': 'url(\'../img/halloween.svg\')',
          'background-size': '100%',
          'background-repeat': 'no-repeat',
          'background-color': '#d3581b'
        },
        text: '#FED85B',
        subtext: '#FED85B',
        contrast: '#444'
      }
    }
  )
}
