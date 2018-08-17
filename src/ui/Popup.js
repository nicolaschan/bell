const m = require('mithril')
const PopupModel = require('../PopupModel').default

var Popup = {
  oninit: function (vnode) {
    vnode.attrs.popupModel = new PopupModel(vnode.attrs.source)
    vnode.attrs.popupModel.initialize()
  },
  view: function (vnode) {
    const popupModel = vnode.attrs.popupModel
    if (!popupModel.messages || popupModel.messages.length === 0) { return }
    var bellTimer = vnode.attrs.bellTimer
    var theme = vnode.attrs.themeManager.currentTheme.theme(bellTimer)
    return m('span', {
      style: {
        visibility: (popupModel.messages) ? 'visible' : 'hidden' }
    }, m('.top.right.popup.fade-in', {
      style: theme.contrast
    }, m('table',
      // not sure if iteration order is guaranteed, but oh well
      popupModel.messages.map((msg) => m('tr', [
        m('td', m(`${msg.href ? 'a.link' : 'span'}.center-vertical[target=_blank]`, {
          href: msg.href,
          style: theme.subtext
        }, msg.text)),
        m('td', m('a.dismiss.center-vertical[href=javascript:void(0)]', {
          onclick: function () {
            popupModel.hide(msg.text, false)
          }
        }, m('i.dismiss-icon.material-icons', 'cancel')))
      ]))
    )))
  },
  onremove: function (vnode) {
    vnode.attrs.popupModel.stopRefreshing()
  }
}

module.exports = Popup
