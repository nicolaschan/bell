import * as m from 'mithril'

export default {
  view (vnode: m.Vnode<{}>) {
    return m('.footer-right', m('a[href=/settings]', {
      oncreate: m.route.link
    }, m('i.settings-icon.icon.material-icons', 'settings')))
  }
} as m.Component<{}, {}>
