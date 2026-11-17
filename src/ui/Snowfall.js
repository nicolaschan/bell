const m = require('mithril')

// Falling paper-cut snowflakes over the timer (the "snow" seasonal overlay).
// Each flake is an image moved by CSS animations (fall, sway, spin), which the
// browser runs on the graphics hardware, so the page does no work per frame.
// Layering (above the pie, below the text) and opacity are set in CSS.

const FLAKE_DESIGNS = 18

const random = (min, max) => min + Math.random() * (max - min)

// Roughly one flake per 40,000 px² of screen, so phones get fewer than desktops
const flakeCount = () => Math.max(10, Math.min(48, Math.round(window.innerWidth * window.innerHeight / 40000)))

const makeFlakes = () => {
  // Flakes are sized relative to the 1512px-wide design (114-300px there)
  const scale = Math.max(0.45, Math.min(1, window.innerWidth / 1512))
  const flakes = []
  for (let i = 0; i < flakeCount(); i++) {
    const size = random(100, 260) * scale
    const fall = random(22, 48) / (0.6 + size / 400) // seconds per screen; bigger flakes fall a bit faster
    const sway = random(4, 8)
    flakes.push({
      design: 1 + Math.floor(Math.random() * FLAKE_DESIGNS),
      size: Math.round(size),
      left: random(-5, 100),
      fall,
      // A negative delay starts each flake partway down, so the screen begins full
      delay: -random(0, fall),
      sway,
      swayDistance: Math.round(random(12, 40)),
      swayDelay: -random(0, sway),
      spin: random(30, 70),
      spinDirection: Math.random() < 0.5 ? 'normal' : 'reverse'
    })
  }
  return flakes
}

const Snowfall = {
  oninit (vnode) {
    vnode.state.flakes = makeFlakes()
  },
  view (vnode) {
    return m('.seasonal-overlay.snowfall[aria-hidden=true]', vnode.state.flakes.map((flake, i) =>
      m('.flake', {
        key: i,
        style: {
          left: `${flake.left}%`,
          width: `${flake.size}px`,
          height: `${flake.size}px`,
          'animation-duration': `${flake.fall}s`,
          'animation-delay': `${flake.delay}s`
        }
      }, m('.flake-sway', {
        // A style string, because Mithril 1 can't set custom properties from a style object
        style: `--sway: ${flake.swayDistance}px; animation-duration: ${flake.sway}s; animation-delay: ${flake.swayDelay}s;`
      }, m('img', {
        src: `/img/redesign/snowflakes/flake-${flake.design}.webp`,
        alt: '',
        decoding: 'async',
        style: {
          'animation-duration': `${flake.spin}s`,
          'animation-direction': flake.spinDirection
        }
      })))
    ))
  }
}

module.exports = Snowfall
