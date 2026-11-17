const m = require('mithril')
const PopupModel = require('../PopupModel').default
const Icon = require('./Icon')

// Announcements from the schedules repo's message.json, shown one at a time
const Popup = {
  oninit: function (vnode) {
    vnode.state.popupModel = new PopupModel(vnode.attrs.source)
    vnode.state.popupModel.initialize()
  },
  view: function (vnode) {
    const popupModel = vnode.state.popupModel
    const messages = popupModel.messages
    if (!messages || messages.length === 0) {
      return null
    }
    const message = messages[0]
    return m('.pill-notice.announcement[role=status]', [
      message.href
        ? m('a[target=_blank][rel=noopener]', { href: message.href }, message.text)
        : m('span', message.text),
      m('button.icon-button.plain.small[type=button]', {
        title: 'Dismiss',
        'aria-label': 'Dismiss',
        onclick: () => popupModel.markAsRead(message.text, true)
      }, m(Icon, { name: 'x', size: 16 }))
    ])
  },
  onremove: function (vnode) {
    vnode.state.popupModel.stopRefreshing()
  }
}

module.exports = Popup
