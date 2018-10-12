import * as m from 'mithril'

interface IAttrs {
  visible: boolean
}

export default {
  view (vnode: m.Vnode<IAttrs>) {
    return m('i.down-arrow.pulse.material-icons', {
      onclick () {
        document.getElementById('page2')!.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      },
      style: {
        visibility: vnode.attrs.visible ? 'hidden' : 'visible'
      }
    }, 'keyboard_arrow_down')
  }
} as m.Component<IAttrs, {}>
