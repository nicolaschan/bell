const m = require('mithril')

var SchoolIndicator = {
  view: function (vnode) {
    var bellTimer = vnode.attrs.bellTimer
    var theme = vnode.attrs.themeManager.currentTheme.theme(bellTimer)

    return m('.top.left.popup.school-indicator', m('table', m('tr', [
      m('td', m('a.no-decoration.center-vertical', {
        href: '/settings',
        style: theme.subtext
      }, vnode.children))
    ])))
  }
}

module.exports = SchoolIndicator
