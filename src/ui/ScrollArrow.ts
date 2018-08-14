import * as $ from 'jquery'
import * as m from 'mithril'

interface IAttrs {
  visible: boolean
}

export default {
  view (vnode: m.Vnode<IAttrs>) {
    return m('i.down-arrow.pulse.material-icons', {
      onclick () {
        $('body, html').animate({
          scrollTop: $('#page2').offset()!.top
        }, 1500)
      },
      style: {
        visibility: vnode.attrs.visible ? 'hidden' : 'visible'
      }
    }, 'keyboard_arrow_down')
  }
} as m.Component<IAttrs, {}>
