const m = require('mithril')

// Red paper lanterns hanging from the top of the page on Lunar New Year (part
// of the "lunar" seasonal overlay). Each sways gently from its string.

// Where each lantern hangs: across the page (%), string length (px), size and
// sway timing. On wide screens they hang in the gap between the school name and
// the buttons; on phones they hang lower, at the edges, below the header.
const WIDE = [
  { left: 31, string: 14, size: 0.9, sway: 3.6, delay: -0.4 },
  { left: 42, string: 48, size: 1, sway: 4.2, delay: -2.1 },
  { left: 58, string: 30, size: 1, sway: 3.9, delay: -1.3 },
  { left: 69, string: 4, size: 0.85, sway: 4.6, delay: -3.0 }
]
const NARROW = [
  { left: 8, string: 62, size: 0.9, sway: 3.8, delay: -0.4 },
  { left: 33, string: 6, size: 0.8, sway: 4.3, delay: -2.1 },
  { left: 92, string: 70, size: 1, sway: 4.0, delay: -1.3 }
]

const RED = '#d7261e'
const RED_DARK = '#a5141a'
const GOLD = '#f2b33d'

const lantern = () => m('svg', { viewBox: '0 0 60 108', width: 60, height: 108 }, [
  // Tassel
  m('line', { x1: 30, y1: 64, x2: 30, y2: 72, stroke: GOLD, 'stroke-width': 2 }),
  m('circle', { cx: 30, cy: 73, r: 3, fill: GOLD }),
  m('path', { d: 'M25 76 h10 l2 30 h-14 z', fill: RED }),
  m('path', { d: 'M27 76 v30 M30 76 v30 M33 76 v30', stroke: RED_DARK, 'stroke-width': 0.8 }),
  // Body with ribs
  m('ellipse', { cx: 30, cy: 34, rx: 28, ry: 26, fill: RED }),
  m('ellipse', { cx: 30, cy: 34, rx: 18, ry: 26, fill: 'none', stroke: RED_DARK, 'stroke-width': 1.2 }),
  m('ellipse', { cx: 30, cy: 34, rx: 7, ry: 26, fill: 'none', stroke: RED_DARK, 'stroke-width': 1.2 }),
  m('ellipse', { cx: 19, cy: 26, rx: 5, ry: 10, fill: '#ffffff', opacity: 0.18 }),
  // Gold caps
  m('rect', { x: 17, y: 4, width: 26, height: 7, rx: 2, fill: GOLD }),
  m('rect', { x: 17, y: 57, width: 26, height: 7, rx: 2, fill: GOLD }),
  m('rect', { x: 28, y: 0, width: 4, height: 5, fill: GOLD })
])

const Lanterns = {
  view () {
    const lanterns = window.innerWidth < 700 ? NARROW : WIDE
    return m('.seasonal-overlay.lanterns[aria-hidden=true]', lanterns.map((l, i) =>
      m('.lantern', {
        key: i,
        // A style string, because Mithril 1 can't set custom properties from a style object
        style: `left: ${l.left}%; --size: ${l.size}; animation-duration: ${l.sway}s; animation-delay: ${l.delay}s;`
      }, [
        m('.lantern-string', { style: { height: `${l.string}px` } }),
        lantern()
      ])))
  }
}

module.exports = Lanterns
