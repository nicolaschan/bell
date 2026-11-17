const m = require('mithril')

// The countdown pie. The slice that remains is the time left in the current
// period: its left edge is fixed at 12 o'clock and its right edge sweeps
// clockwise towards 12 as the period elapses, so the pie empties when the bell rings.
const draw = (canvas, proportionElapsed, theme) => {
  const parent = canvas.parentNode
  if (!parent) {
    return
  }
  const rect = parent.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const width = Math.round(rect.width * dpr)
  const height = Math.round(rect.height * dpr)
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }

  const ctx = canvas.getContext('2d')
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const remaining = Math.max(0, Math.min(1, 1 - proportionElapsed))
  if (remaining <= 0) {
    return
  }
  const radius = height / 2

  // Mirror horizontally so "clockwise" in canvas space runs counter-clockwise
  // on screen: the slice and the gradient both start at 12 o'clock and
  // extend counter-clockwise.
  ctx.translate(width / 2, height / 2)
  ctx.scale(-1, 1)

  const start = -Math.PI / 2
  const end = start + remaining * 2 * Math.PI

  if (theme.stops.length === 1) {
    ctx.fillStyle = theme.stops[0]
  } else if (ctx.createConicGradient) {
    const gradient = ctx.createConicGradient(start, 0, 0)
    theme.stops.forEach((color, i) => gradient.addColorStop(i / theme.stops.length, color))
    gradient.addColorStop(1, theme.stops[theme.stops.length - 1])
    ctx.fillStyle = gradient
  } else {
    const gradient = ctx.createLinearGradient(0, -radius, 0, radius)
    theme.stops.forEach((color, i) => gradient.addColorStop(i / (theme.stops.length - 1), color))
    ctx.fillStyle = gradient
  }

  ctx.beginPath()
  ctx.moveTo(0, 0)
  if (remaining >= 1) {
    ctx.arc(0, 0, radius, 0, 2 * Math.PI)
  } else {
    ctx.arc(0, 0, radius, start, end, false)
  }
  ctx.closePath()
  ctx.fill()
}

const Pie = {
  oncreate (vnode) {
    draw(vnode.dom, vnode.attrs.proportionElapsed, vnode.attrs.theme)
  },
  onupdate (vnode) {
    draw(vnode.dom, vnode.attrs.proportionElapsed, vnode.attrs.theme)
  },
  view () {
    return m('canvas.pie', { 'aria-hidden': 'true' })
  }
}

module.exports = Pie
