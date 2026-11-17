const m = require('mithril')

// A string of twinkling Christmas lights wrapped around the date on Christmas
// Day (the "lights" seasonal overlay). The wire frames the date and the bulbs
// point outward, so nothing covers the text. attrs: text (the date)

const COLORS = ['red', 'green', 'gold', 'blue']

const bulb = (i, side, position) => m(`span.bulb.${side}.${COLORS[i % COLORS.length]}`, {
  key: `${side}-${position}`,
  style: Object.assign(
    { 'animation-delay': `${-((i * 0.37) % 1.6).toFixed(2)}s` },
    side === 'top' || side === 'bottom' ? { left: `${position}%` } : { top: `${position}%` }
  )
})

const ChristmasLights = {
  view (vnode) {
    const { text } = vnode.attrs
    // About one bulb for every three characters along the top and bottom
    const perRow = Math.max(5, Math.round(text.length / 3))
    const bulbs = []
    let n = 0
    for (let i = 0; i < perRow; i++) bulbs.push(bulb(n++, 'top', ((i + 0.5) / perRow) * 100))
    bulbs.push(bulb(n++, 'right', 50))
    for (let i = perRow - 1; i >= 0; i--) bulbs.push(bulb(n++, 'bottom', ((i + 0.5) / perRow) * 100))
    bulbs.push(bulb(n++, 'left', 50))

    return m('span.lit-date', [
      m('span.lit-date-text', text),
      m('span.christmas-lights[aria-hidden=true]', [
        m('span.lights-wire'),
        bulbs
      ])
    ])
  }
}

module.exports = ChristmasLights
