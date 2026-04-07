const BasicColorTheme = require('./templates/BasicColorTheme')
const ColorSchemeTransformations = require('./ColorSchemeTransformations')
const BasicTiming = require('./timings/BasicTiming')

module.exports = {
  name: 'Gradient - Dark',
  theme: BasicColorTheme(
    ColorSchemeTransformations.fromObjectStrings,
    BasicTiming,
    [{
      background: 'black',
      text: {
        'background-image': 'linear-gradient(to bottom right, orange, red)',
        '-webkit-background-clip': 'text',
        'background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
        'color': 'transparent'
      },
      subtext: 'white',
      contrast: '#444'
    }, {
      background: 'black',
      text: {
        'background-image': 'linear-gradient(to bottom right, yellow, orange)',
        '-webkit-background-clip': 'text',
        'background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
        'color': 'transparent'
      },
      subtext: 'white',
      contrast: '#444'
    }, {
      background: 'black',
      text: {
        'background-image': 'linear-gradient(to bottom right, lime, yellow)',
        '-webkit-background-clip': 'text',
        'background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
        'color': 'transparent'
      },
      subtext: 'white',
      contrast: '#444'
    }, {
      background: 'black',
      text: {
        'background-image': 'linear-gradient(to bottom right, cyan, lime)',
        '-webkit-background-clip': 'text',
        'background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
        'color': 'transparent'
      },
      subtext: 'white',
      contrast: '#444'
    }],
    {
      weekend: {
        background: 'black',
        text: {
          'background-image': 'linear-gradient(to bottom right, #e5bcff, cyan)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'color': 'transparent'
        },
        subtext: 'white',
        contrast: '#444'
      },
      holiday: {
        background: 'black',
        text: {
          'background-image': 'linear-gradient(to bottom right, cyan, #e5bcff)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'color': 'transparent'
        },
        subtext: 'white',
        contrast: '#444'
      }
    }
  )
}
