// A spinning Earth for the countdown pie on Earth Day (the "earth" seasonal
// overlay). A flat world map is wrapped onto a sphere: each pixel of the disc
// is looked up once (its latitude, longitude and shading), so a frame is just
// a table lookup with the longitude shifted by the spin.

const TEXTURE_URL = '/img/redesign/earth.webp'
const OCEAN = [61, 143, 224]
const TILT = 23.4 * Math.PI / 180
const SECONDS_PER_TURN = 40

let map = null // { width, height, pixels }
let loading = false

const loadMap = onload => {
  if (map || loading) return
  loading = true
  const img = new window.Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    map = { width: canvas.width, height: canvas.height, pixels: ctx.getImageData(0, 0, canvas.width, canvas.height).data }
    onload()
  }
  img.onerror = () => { loading = false }
  img.src = TEXTURE_URL
}

// Per-pixel lookup for a disc `size` pixels across
const buildTable = (size, mapWidth, mapHeight) => {
  const count = size * size
  const lon = new Float32Array(count)
  const row = new Int32Array(count)
  const light = new Float32Array(count)
  const inside = new Uint8Array(count)
  const cosT = Math.cos(TILT)
  const sinT = Math.sin(TILT)
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const i = py * size + px
      const x = (px + 0.5) / size * 2 - 1
      const y = 1 - (py + 0.5) / size * 2
      const r2 = x * x + y * y
      if (r2 > 1) continue
      inside[i] = 1
      const z = Math.sqrt(1 - r2)
      // Tilt the axis towards the viewer's top-right
      const y2 = y * cosT + z * sinT
      const z2 = -y * sinT + z * cosT
      const lat = Math.asin(Math.max(-1, Math.min(1, y2)))
      lon[i] = Math.atan2(x, z2) / (2 * Math.PI) // -0.5..0.5 of a turn
      row[i] = Math.min(mapHeight - 1, Math.floor((0.5 - lat / Math.PI) * mapHeight)) * mapWidth
      // Soft light from the upper left, never fully dark
      light[i] = Math.min(1.12, 0.6 + 0.55 * Math.max(0, -0.45 * x + 0.45 * y + 0.77 * z))
    }
  }
  return { size, lon, row, light, inside }
}

// Paint the globe, `size` pixels across, into `canvas`; `seconds` turns it
const paintGlobe = (state, canvas, size, seconds, onready) => {
  if (canvas.width !== size || canvas.height !== size) {
    canvas.width = size
    canvas.height = size
  }
  const ctx = canvas.getContext('2d')
  if (!map) {
    loadMap(onready)
    ctx.fillStyle = `rgb(${OCEAN.join(',')})`
    ctx.fillRect(0, 0, size, size)
    return
  }
  if (!state.table || state.table.size !== size) {
    state.table = buildTable(size, map.width, map.height)
    state.image = ctx.createImageData(size, size)
  }
  const { lon, row, light, inside } = state.table
  const out = state.image.data
  const pixels = map.pixels
  const width = map.width
  const turn = seconds / SECONDS_PER_TURN
  for (let i = 0; i < inside.length; i++) {
    const o = i * 4
    if (!inside[i]) {
      out[o + 3] = 0
      continue
    }
    let u = lon[i] + turn
    u -= Math.floor(u)
    const m = (row[i] + Math.floor(u * width)) * 4
    const l = light[i]
    out[o] = Math.min(255, pixels[m] * l)
    out[o + 1] = Math.min(255, pixels[m + 1] * l)
    out[o + 2] = Math.min(255, pixels[m + 2] * l)
    out[o + 3] = 255
  }
  ctx.putImageData(state.image, 0, 0)
}

module.exports = { paintGlobe }
