import * as m from 'mithril'

export default {
  view (vnode: m.Vnode<{}>) {
    return m('.status-page[role=status]', [
      m('.spinner'),
      m('.status-message', vnode.children)
    ])
  }
} as m.Component<{}, {}>
