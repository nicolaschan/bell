/* global Image */

const BasicColorTheme = require('./templates/BasicColorTheme')
const ColorSchemeTransformations = require('./ColorSchemeTransformations')
const ConstantTiming = require('./timings/ConstantTiming').default

module.exports = {
  name: 'Quack',
  enabled: (secrets) => {
    const now = new Date()
    return (now.getMonth() + 1) === 4 && (now.getDate() === 1)
  },
  specialEffects: (ctx, canvas) => {
    const time = Date.now() / 1000
    const waveHeight = window.innerHeight / 10
    const waveLength = 100
    const waveSpeed = 2
    ctx.fillStyle = 'rgba(0, 100, 255, 0.3)'
    ctx.beginPath()
    ctx.moveTo(0, window.innerHeight)
    for (let x = 0; x < window.innerWidth; x++) {
      const y = waveHeight * Math.sin((x / waveLength) + (time * waveSpeed)) + (window.innerHeight - waveHeight)
      ctx.lineTo(x, y - 100)
    }
    ctx.lineTo(window.innerWidth, window.innerHeight)
    ctx.closePath()
    ctx.fill()
    // omg rubber duck
    const duckSize = 100
    const duckX = window.innerWidth - duckSize - 200
    const duckY = waveHeight * Math.sin((duckX / waveLength) + (time * waveSpeed)) + (window.innerHeight - waveHeight) - duckSize - 120
    const duckImg = new Image()
    duckImg.src = '../img/duck.svg'
    ctx.save()
    ctx.translate(duckX + duckSize / 2, duckY + duckSize / 2)
    ctx.scale(-3, 3)
    const waveAngle = Math.atan(waveHeight * Math.sin((duckX / waveLength) + (time * waveSpeed)) / waveLength)
    ctx.rotate(waveAngle)
    ctx.translate(-duckX - duckSize / 2, -duckY - duckSize / 2)
    ctx.drawImage(duckImg, duckX, duckY, duckSize, duckSize)
    ctx.restore()
  },
  theme: BasicColorTheme(
    ColorSchemeTransformations.fromObjectStrings,
    ConstantTiming(1),
    [{
      background: {
      },
      text: '#000000',
      subtext: '#ffae00ff',
      contrast: '#444'
    }]
  )
}
