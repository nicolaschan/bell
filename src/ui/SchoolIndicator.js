const m = require('mithril')

var SchoolIndicator = {
  view: function (vnode) {
    var model = vnode.attrs.model
    var source = model.bellTimer.source
    var theme = model.themeManager.currentTheme.theme(model.bellTimer)
    var meta = model.requestManager.getSync(`/api/data/${source}/meta`)
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
