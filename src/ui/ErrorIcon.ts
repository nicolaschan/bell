import * as m from 'mithril'

export default {
  view (vnode: m.Vnode<{}>) {
    return m('.centered.loading', [
      m('i.material-icons.loading-icon', 'error'),
      m('br'),
      m('.loading-message', vnode.children)
    ])
  }
} as m.Component<{}, {}>
