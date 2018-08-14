const cookieName = 'theme'
const themes = [
  require('./themes/Default').light,
  require('./themes/Default').dark,
  require('./themes/GradientLight'),
  require('./themes/Pastel').light,
  require('./themes/Pastel').dark,
  require('./themes/Rainbow').light,
  require('./themes/Rainbow').dark,
  require('./themes/Grays').light,
  require('./themes/Grays').dark,
  require('./themes/Blues').light,
  require('./themes/Blues').dark,
  require('./themes/Jonathan')
]

class ThemeManager {
  constructor () {
    this.cookieManager = require('./LocalForageCookieManager').default
    this.themes = {}
    for (var theme of themes) {
      this.themes[theme.name] = theme
    }
  }

  get defaultTheme () {
    return require('./themes/Default').light
  }

  set currentThemeName (themeName) {
    return this.cookieManager.set(cookieName, themeName)
  }
  get currentThemeName () {
    return this.cookieManager.get(cookieName)
  }

  get currentTheme () {
    var theme = this.themes[this.currentThemeName]
    if (!theme || !this.isAvailable(theme.name)) {
      this.currentThemeName = this.defaultTheme.name
      theme = this.themes[this.currentThemeName]
    }
    return theme
  }

  isAvailable (themeName) {
    return !this.themes[themeName].locked ||
      this.cookieManager.get('secrets', []).indexOf(this.themes[themeName].locked) > -1
  }

  get availableThemes () {
    var available = {}
    var themes = this.themes

    for (var name in themes) {
      if (this.isAvailable(name)) {
        available[name] = themes[name]
      }
    }

    return available
  }
}

module.exports = new ThemeManager()
