const m = require('mithril')

// The countdown pie. The slice that remains is the time left in the current
// period: its left edge is fixed at 12 o'clock and its right edge sweeps
// clockwise towards 12 as the period elapses, so the pie empties when the bell rings.
//
// Solid themes fill the slice with one color. Dynamic themes fill it with the
// theme's colors swept around the clock face, with soft blobs of the same
// colors slowly drifting over it.

const TEXTURE_SCALE = 0.25 // the texture is soft, so it is drawn small and scaled up
const FRAME_INTERVAL = 1000 / 30
const DRIFT_SPEED = 1.6 // multiplies how fast the blobs drift

const reducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Each blob drifts on its own slow, looping path (at DRIFT_SPEED 1.6, periods of roughly 15–45 s)
const BLOBS = [
  { fx: 0.24, fy: 0.15, px: 0.0, py: 1.3, reach: 0.34, size: 0.55 },
  { fx: 0.11, fy: 0.27, px: 2.1, py: 0.4, reach: 0.38, size: 0.5 },
  { fx: 0.19, fy: 0.09, px: 4.0, py: 2.6, reach: 0.32, size: 0.6 },
  { fx: 0.13, fy: 0.21, px: 1.2, py: 4.4, reach: 0.36, size: 0.45 },
  { fx: 0.26, fy: 0.17, px: 3.3, py: 5.1, reach: 0.3, size: 0.5 },
  { fx: 0.09, fy: 0.13, px: 5.2, py: 3.0, reach: 0.4, size: 0.55 }
]

const withAlpha = (hex, alpha) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

const addConicStops = (gradient, stops) => {
  stops.forEach((color, i) => gradient.addColorStop(i / stops.length, color))
  gradient.addColorStop(1, stops[stops.length - 1])
}

// Paint the animated texture for a dynamic theme into a small square canvas
const paintTexture = (texture, size, stops, seconds) => {
  if (texture.width !== size || texture.height !== size) {
    texture.width = size
    texture.height = size
  }
  const ctx = texture.getContext('2d')
  const c = size / 2

  // Base: the theme's colors swept around the clock face, starting at 12
  if (ctx.createConicGradient) {
    const base = ctx.createConicGradient(-Math.PI / 2, c, c)
    addConicStops(base, stops)
    ctx.fillStyle = base
  } else {
    const base = ctx.createLinearGradient(0, 0, 0, size)
    stops.forEach((color, i) => base.addColorStop(i / (stops.length - 1), color))
    ctx.fillStyle = base
  }
  ctx.fillRect(0, 0, size, size)

  // Drifting blobs of the same colors, blended softly over the base
  stops.forEach((color, i) => {
    const blob = BLOBS[i % BLOBS.length]
    const x = c + Math.cos(seconds * blob.fx + blob.px) * size * blob.reach
    const y = c + Math.sin(seconds * blob.fy + blob.py) * size * blob.reach
    const r = size * blob.size
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r)
    glow.addColorStop(0, withAlpha(color, 0.75))
    glow.addColorStop(0.5, withAlpha(color, 0.3))
    glow.addColorStop(1, withAlpha(color, 0))
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, size, size)
  })
}

const draw = (canvas, state, proportionElapsed, theme, seconds) => {
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
  // on screen: the slice and the color sweep both start at 12 o'clock and
  // extend counter-clockwise.
  ctx.translate(width / 2, height / 2)
  ctx.scale(-1, 1)

  const start = -Math.PI / 2
  ctx.beginPath()
  ctx.moveTo(0, 0)
  if (remaining >= 1) {
    ctx.arc(0, 0, radius, 0, 2 * Math.PI)
  } else {
    ctx.arc(0, 0, radius, start, start + remaining * 2 * Math.PI, false)
  }
  ctx.closePath()

  if (theme.stops.length === 1) {
    ctx.fillStyle = theme.stops[0]
    ctx.fill()
    return
  }

  if (!state.texture) {
    state.texture = document.createElement('canvas')
  }
  const size = Math.max(16, Math.ceil(2 * radius * TEXTURE_SCALE))
  paintTexture(state.texture, size, theme.stops, seconds)
  ctx.save()
  ctx.clip()
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(state.texture, -radius, -radius, 2 * radius, 2 * radius)
  ctx.restore()
}

const Pie = {
  oncreate (vnode) {
    const state = vnode.state
    state.attrs = vnode.attrs
    state.started = Date.now()
    state.lastFrame = 0
    const render = () => {
      const { proportionElapsed, theme } = state.attrs
      const seconds = reducedMotion() ? 0 : DRIFT_SPEED * (Date.now() - state.started) / 1000
      draw(vnode.dom, state, proportionElapsed, theme, seconds)
    }
    state.render = render
    // Dynamic themes animate on their own clock; solid ones redraw with the app
    const loop = time => {
      state.frame = window.requestAnimationFrame(loop)
      if (state.attrs.theme.stops.length > 1 && !reducedMotion() && time - state.lastFrame >= FRAME_INTERVAL) {
        state.lastFrame = time
        render()
      }
    }
    state.frame = window.requestAnimationFrame(loop)
    render()
  },
  onupdate (vnode) {
    vnode.state.attrs = vnode.attrs
    if (vnode.attrs.theme.stops.length === 1 || reducedMotion()) {
      vnode.state.render()
    }
  },
  onremove (vnode) {
    window.cancelAnimationFrame(vnode.state.frame)
  },
  view () {
    return m('canvas.pie', { 'aria-hidden': 'true' })
  }
}

module.exports = Pie
