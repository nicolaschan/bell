const m = require('mithril')

const themeManager = require('../ThemeManager')
const requestManager = require('../RequestManager2').default

var SchoolIndicator = {
  view: function (vnode) {
    var bellTimer = vnode.attrs.bellTimer
    var source = bellTimer.source
    var theme = themeManager.currentTheme.theme(bellTimer)
    var meta = requestManager.getSync(`/api/data/${source}/meta`)
    if (!meta) { return }

    return m('.top.left.popup.school-indicator', m('table', m('tr', [
      m('td', m('a.no-decoration.center-vertical', {
        href: '/settings',
        style: theme.subtext
      }, meta.name))
    ])))
  }
}

module.exports = SchoolIndicator
