const m = require('mithril')

// A string of twinkling Christmas lights draped across the date on Christmas
// Day (the "lights" seasonal overlay). attrs: text (the date shown underneath)

const COLORS = ['red', 'green', 'gold', 'blue']

const ChristmasLights = {
  view (vnode) {
    const { text } = vnode.attrs
    // About one bulb for every two characters of the date
    const count = Math.max(8, Math.round(text.length / 2))
    // The wire droops between bulbs; each bulb hangs from the bottom of a droop
    const segment = 20
    let wire = 'M0 2'
    for (let i = 0; i < count; i++) {
      wire += ` Q${i * segment + segment / 2} 12 ${(i + 1) * segment} 2`
    }
    return m('span.lit-date', [
      m('span.lit-date-text', text),
      m('span.christmas-lights[aria-hidden=true]', [
        m('svg.lights-wire', {
          viewBox: `0 0 ${count * segment} 12`,
          preserveAspectRatio: 'none'
        }, m('path', { d: wire })),
        Array.from({ length: count }, (_, i) => m(`span.bulb.${COLORS[i % COLORS.length]}`, {
          key: i,
          style: {
            left: `${((i + 0.5) / count) * 100}%`,
            'animation-delay': `${-((i * 0.37) % 1.6).toFixed(2)}s`,
            transform: `translateX(-50%) rotate(${i % 2 ? 10 : -10}deg)`
          }
        }))
      ])
    ])
  }
}

module.exports = ChristmasLights
