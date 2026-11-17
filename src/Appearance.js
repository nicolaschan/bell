const cookieManager = require('./LocalForageCookieManager').default

const THEME_KEY = 'appearance_theme'
const DARK_MODE_KEY = 'dark_mode'

// Solid theme colors. `swatch` is the color shown in the settings picker and
// `pie` is the (lighter) color used for the countdown pie and schedule page.
const colorThemes = [
  { id: 'sky', name: 'Sky', swatch: '#14c1f9', pie: '#67daff' },
  { id: 'green', name: 'Green', swatch: '#47ad76', pie: '#84cba4' },
  { id: 'red', name: 'Red', swatch: '#bc303d', pie: '#d6737c' },
  { id: 'orange', name: 'Orange', swatch: '#f16445', pie: '#f6977f' },
  { id: 'pink', name: 'Pink', swatch: '#ff91b4', pie: '#ffb5cc' },
  { id: 'yellow', name: 'Yellow', swatch: '#f8ce4b', pie: '#fbdc7c' },
  { id: 'periwinkle', name: 'Periwinkle', swatch: '#757af9', pie: '#a0a3fb' }
].map(theme => Object.assign({ type: 'color', stops: [theme.pie] }, theme))

// Dynamic themes fill the pie with a gradient that sweeps around the clock
// face, so the color at the shrinking edge changes as the period counts down.
// Stops are listed in the order they appear from 12 o'clock.
const dynamicThemes = [
  ['sunrise', 'Sunrise', ['#e24019', '#ee9737', '#c4c456', '#4dae75', '#24bbd2', '#39a6f9']],
  ['berry', 'Berry', ['#f5505c', '#e55a8a', '#d465bb', '#c571ec', '#8a8cec', '#4da7ea']],
  ['cotton-candy', 'Cotton candy', ['#feadc6', '#f0b5ce', '#e2bfd7', '#d6cae1', '#c8d3ea', '#b9def3']],
  ['twilight', 'Twilight', ['#851bcf', '#742dd0', '#6242d1', '#5257d4', '#416bd6', '#2f80d8']],
  ['seafoam', 'Seafoam', ['#fdd195', '#e6d3a3', '#ced5b4', '#b8d9c4', '#a0dcd4', '#88dee5']],
  ['citrus', 'Citrus', ['#fbd960', '#f9c755', '#f9b449', '#f9a33f', '#f89133', '#f87d28']],
  ['sunset', 'Sunset', ['#a90da5', '#b4218d', '#c13775', '#cf4e5d', '#dc6445', '#e97a2c']],
  ['peach', 'Peach', ['#ff606d', '#fe6e6d', '#fe7f6d', '#ff916f', '#ffa270', '#ffb270']],
  ['mint', 'Mint', ['#f5feae', '#d8f4ad', '#bbebac', '#9ee2ad', '#80d9ad', '#60cfac']],
  ['ember', 'Ember', ['#ee1814', '#c82c38', '#a0415d', '#795884', '#516daa', '#2883d1']],
  ['cocoa', 'Cocoa', ['#a33931', '#8d3a35', '#763b3a', '#603e41', '#4a4046', '#33414b']],
  ['ocean', 'Ocean', ['#2a49ff', '#3b5dfe', '#4f74fe', '#638cff', '#77a3ff', '#8ab9ff']],
  ['forest', 'Forest', ['#283c86', '#2c4c7b', '#315d70', '#376f66', '#3b805c', '#409151']]
].map(([id, name, stops], i) => ({
  id,
  name,
  type: 'dynamic',
  stops,
  icon: `/img/redesign/themes/dynamic-${i + 1}.png`
}))

const allThemes = colorThemes.concat(dynamicThemes)
const DEFAULT_THEME = colorThemes[0]

const findTheme = id => allThemes.find(theme => theme.id === id)

// WCAG relative luminance of a #rrggbb color
const luminance = hex => {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// True when white text reads better than black on the theme's color(s).
// 0.179 is where black and white text have equal contrast.
const isDarkTheme = theme =>
  theme.stops.reduce((sum, color) => sum + luminance(color), 0) / theme.stops.length < 0.179

const Appearance = {
  colorThemes,
  dynamicThemes,

  get theme () {
    return findTheme(cookieManager.get(THEME_KEY)) || DEFAULT_THEME
  },

  setTheme (id) {
    if (findTheme(id)) {
      cookieManager.set(THEME_KEY, id).catch(() => {})
    }
  },

  get darkMode () {
    return cookieManager.get(DARK_MODE_KEY, false) === true
  },

  setDarkMode (enabled) {
    cookieManager.set(DARK_MODE_KEY, !!enabled).catch(() => {})
  },

  // The page background color for the current mode (matches --background-primary)
  pageColor () {
    return Appearance.darkMode ? '#161514' : '#f8f4f0'
  },

  // CSS background for surfaces painted in the theme color (e.g. the schedule page)
  background (theme = Appearance.theme) {
    if (theme.stops.length === 1) {
      return theme.stops[0]
    }
    return `linear-gradient(135deg, ${theme.stops.join(', ')})`
  },

  // Keep the document's light/dark and theme CSS variables in sync
  apply () {
    const root = document.documentElement
    const dark = Appearance.darkMode
    if (root.getAttribute('data-bell-theme') !== (dark ? 'dark' : 'light')) {
      root.setAttribute('data-bell-theme', dark ? 'dark' : 'light')
    }
    // Text on surfaces painted in the theme color turns white for dark themes
    const surface = isDarkTheme(Appearance.theme) ? 'dark' : 'light'
    if (root.getAttribute('data-bell-surface') !== surface) {
      root.setAttribute('data-bell-surface', surface)
    }
    const background = Appearance.background()
    if (root.style.getPropertyValue('--brand-color-background') !== background) {
      root.style.setProperty('--brand-color-background', background)
    }
  }
}

Appearance.isDarkTheme = isDarkTheme

module.exports = Appearance
