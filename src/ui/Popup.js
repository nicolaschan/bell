const m = require('mithril')

var Popup = {
  view: function (vnode) {
    var model = vnode.attrs.model
    if (!model.popupModel.visible) { return }
    var bellTimer = model.bellTimer
    var theme = model.themeManager.currentTheme.theme(bellTimer)

    return m('span', {
      style: {
        visibility: (model.popupModel.visible) ? 'visible' : 'hidden' }
    }, m('.top.right.popup.fade-in', {
      style: theme.contrast
    }, m('table', m('tr', [
      m('td', m(`${model.popupModel.href ? 'a.link' : 'span'}.center-vertical[target=_blank]`, {
        href: model.popupModel.href,
        style: theme.subtext
      }, model.popupModel.text)),
      m('td', m('a.dismiss.center-vertical[href="#"]', {
        onclick: function () {
          model.popupModel.visible = false
        }
      }, m('i.dismiss-icon.material-icons', 'cancel')))
    ]))))
  }
}

module.exports = Popup
