const BasicColorTheme = require('./templates/BasicColorTheme')
const ColorSchemeTransformations = require('./ColorSchemeTransformations')
const BasicTiming = require('./timings/BasicTiming')

const snowflakes = new Set()
module.exports = {
  name: 'Winter',
  enabled: (secrets) => {
    const enabled = (new Date().getMonth() + 1) === 12
    return enabled
  },
  specialEffects: (ctx, canvas) => {
    if (snowflakes.size < 50 && Math.random() < 0.05) {
      snowflakes.add({ x: Math.random() * window.innerWidth, y: -10 })
    }
    for (const snowflake of snowflakes) {
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(snowflake.x, snowflake.y, snowflake.clicked ? 10 : 5, 0, 2 * 3.14)
      ctx.fill()
      if (snowflake.y > window.innerHeight) {
        snowflakes.delete(snowflake)
      }
      snowflake.y += 2
      snowflake.x += (Math.random() - 0.5) * 2
    }
    canvas.addEventListener('mousedown', (e) => {
      for (const snowflake of snowflakes) {
        if (Math.abs(snowflake.x - e.x) < 20 && Math.abs(snowflake.y - e.y) < 20) {
          snowflake.clicked = !snowflake.clicked
          break
        }
      }
    })
  },
  theme: BasicColorTheme(
    ColorSchemeTransformations.fromObjectStrings,
    BasicTiming,
    [{
      background: {
        'background-image': 'linear-gradient(to bottom, midnightblue,  white)',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
        'background-color': 'black'
      },
      text: '#000d33',
      subtext: '#001a66',
      contrast: 'white'
    }, {
      background: {
        'background-image': 'linear-gradient(to bottom, mediumblue, white)',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
        'background-color': '#8A0707'
      },
      text: '#001a66',
      subtext: '#002699',
      contrast: 'white'
    }, {
      background: {
        'background-image': 'linear-gradient(to bottom, dodgerblue, white)',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
        'background-color': '#bf3305'
      },
      text: '#002699',
      subtext: '#0033cc',
      contrast: '#fff'
    }, {
      background: {
        'background-image': 'linear-gradient(to bottom, skyblue, white)',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
        'background-color': '#d3581b'
      },
      text: '#0033cc',
      subtext: '#0040ff',
      contrast: '#fff'
    }], {
      holiday: {
        background: {
          'background-image': 'linear-gradient(to bottom, lightskyblue, white)',
          'background-position': 'center',
          'background-repeat': 'no-repeat',
          'background-color': '#d3581b'
        },
        text: '#0033cc',
        subtext: '#0099ff',
        contrast: '#fff'
      },
      weekend: {
        background: {
          'background-image': 'linear-gradient(to bottom, lightskyblue, white)',
          'background-position': 'center',
          'background-repeat': 'no-repeat',
          'background-color': '#d3581b'
        },
        text: '#0033cc',
        subtext: '#0099ff',
        contrast: '#fff'
      }
    }
  )
}
