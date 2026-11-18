const m = require('mithril')

// Fireworks over the timer on New Year's Day (the "fireworks" seasonal
// overlay). Each firework is a rocket that rises and bursts into sparks, all
// moved by CSS animations. After each burst it moves to a new spot and color
// for its next launch.

const COLORS = ['#ff3b5c', '#ffb000', '#7b61ff', '#00b3a4', '#ff6b1a', '#e83e8c', '#1e90ff', '#ffd23f']
const SPARKS = 28

const random = (min, max) => min + Math.random() * (max - min)
const pick = list => list[Math.floor(Math.random() * list.length)]

const place = (el, scale) => {
  el.style.left = `${random(8, 92)}%`
  el.style.top = `${random(12, 55)}%`
  el.style.color = pick(COLORS)
  el.style.setProperty('--radius', `${Math.round(random(100, 180) * scale)}px`)
}

const burstCount = () => (window.innerWidth < 600 ? 4 : 6)

const Burst = {
  oncreate (vnode) {
    const el = vnode.dom
    const scale = Math.max(0.6, Math.min(1, window.innerWidth / 1200))
    place(el, scale)
    // Move to a new spot each time the animation loops
    el.addEventListener('animationiteration', e => {
      if (e.target === el) place(el, scale)
    })
  },
  view (vnode) {
    const { duration, delay } = vnode.attrs
    // Style strings, because Mithril 1 can't set custom properties from a style object
    const timing = `animation-duration: ${duration}s; animation-delay: ${delay}s;`
    const sparks = []
    for (let i = 0; i < SPARKS; i++) {
      sparks.push(m('span.spark', {
        style: `${timing} --angle: ${Math.round((360 / SPARKS) * i + random(-4, 4))}deg; --reach: ${random(0.75, 1).toFixed(2)};`
      }))
    }
    return m('.firework', { style: timing }, [m('span.rocket', { style: timing }), m('span.flash', { style: timing }), sparks])
  }
}

const Fireworks = {
  oninit (vnode) {
    vnode.state.bursts = []
    for (let i = 0; i < burstCount(); i++) {
      const duration = random(2.8, 3.8)
      vnode.state.bursts.push({ duration, delay: -random(0, duration) })
    }
  },
  view (vnode) {
    return m('.seasonal-overlay.fireworks[aria-hidden=true]',
      vnode.state.bursts.map((burst, i) => m(Burst, Object.assign({ key: i }, burst))))
  }
}

module.exports = Fireworks
