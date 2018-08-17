const m = require('mithril')
const PopupModel = require('../PopupModel').default

var dismiss = (pm, text) => m('td', m('a.dismiss.center-vertical[href=javascript:void(0)]', {
  onclick: function () {
    pm.hide(text, false)
  }
}, m('i.dismiss-icon.material-icons', 'cancel')))

var collapseStr = () => expanded ? 'collapse' : 'expand'
var collapseOrShow = (visible) => m('td', m(`a.${collapseStr()}.center-vertical[href=javascript:void(0)]`, {
  style: { visibility: visible ? 'visible' : 'hidden' },
  onclick: function () {
    expanded = !expanded
  }
}, m(`i.${collapseStr()}-icon.material-icons`, expanded ? 'expand_less' : 'expand_more')))

var expanded = false

var Popup = {
  oninit: function (vnode) {
    vnode.attrs.popupModel = new PopupModel(vnode.attrs.source)
    vnode.attrs.popupModel.initialize()
  },
  view: function (vnode) {
    const messages = vnode.attrs.popupModel.messages
    if (!messages || messages.length === 0) { return }
    var bellTimer = vnode.attrs.bellTimer
    var theme = vnode.attrs.themeManager.currentTheme.theme(bellTimer)
    var row1 = [m('tr', [
      m('td', m(`${messages[0].href ? 'a.link' : 'span'}.center-vertical[target=_blank]`, {
        href: messages[0].href,
        style: theme.subtext
      }, messages[0].text)),
      collapseOrShow(messages.length > 1),
      dismiss(vnode.attrs.popupModel, messages[0].text)
    ])]
    var makeRows = () => (
      // not sure if iteration order is guaranteed, but oh well
      expanded ? messages.slice(1).map((msg) => m('tr', [
        m('td', m(`${msg.href ? 'a.link' : 'span'}.center-vertical[target=_blank]`, {
          href: messages.href,
          style: theme.subtext
        }, msg.text)),
        m('td'), // empty to accomodate first row's collapse button
        dismiss(vnode.attrs.popupModel, msg.text)
      ])) : [])
    return m('span', {
      style: {
        visibility: messages && messages.length > 0 ? 'visible' : 'hidden' }
    }, m('.top.right.popup.fade-in', {
      style: theme.contrast
    }, m('table', row1.concat(makeRows()))
    ))
  },
  onremove: function (vnode) {
    vnode.attrs.popupModel.stopRefreshing()
  }
}

module.exports = Popup
