const m = require('mithril')

// A trigger plus a floating menu that closes on outside click or Escape.
// attrs: trigger (vnode-producing fn taking { open, toggle }), menu (fn taking { close }),
//        align ('left' | 'right'), className
const Dropdown = {
  oninit (vnode) {
    vnode.state.open = false
    vnode.state.close = () => {
      if (vnode.state.open) {
        vnode.state.open = false
        m.redraw()
      }
    }
    vnode.state.onDocumentClick = e => {
      if (vnode.state.dom && !vnode.state.dom.contains(e.target)) {
        vnode.state.close()
      }
    }
    vnode.state.onKeyDown = e => {
      if (e.key === 'Escape') {
        vnode.state.close()
      }
    }
    document.addEventListener('mousedown', vnode.state.onDocumentClick)
    document.addEventListener('touchstart', vnode.state.onDocumentClick)
    document.addEventListener('keydown', vnode.state.onKeyDown)
  },
  oncreate (vnode) {
    vnode.state.dom = vnode.dom
  },
  onremove (vnode) {
    document.removeEventListener('mousedown', vnode.state.onDocumentClick)
    document.removeEventListener('touchstart', vnode.state.onDocumentClick)
    document.removeEventListener('keydown', vnode.state.onKeyDown)
  },
  view (vnode) {
    const state = vnode.state
    const toggle = () => { state.open = !state.open }
    const { align = 'left', className = '' } = vnode.attrs
    return m('.dropdown', { className }, [
      vnode.attrs.trigger({ open: state.open, toggle }),
      state.open
        ? m(`.menu.dropdown-menu.align-${align}`, { role: 'menu' }, vnode.attrs.menu({ close: state.close }))
        : null
    ])
  }
}

const MenuSeparator = { view: () => m('.menu-separator', m('.rule')) }

const MenuButton = {
  view (vnode) {
    const { icon, href, onclick, external } = vnode.attrs
    const Icon = require('./Icon')
    return m(href ? 'a.menu-button' : 'button.menu-button[type=button]', {
      href,
      role: 'menuitem',
      onclick,
      oncreate: href && !external ? m.route.link : undefined
    }, [
      icon ? m(Icon, { name: icon }) : null,
      m('span', vnode.children)
    ])
  }
}

module.exports = { Dropdown, MenuSeparator, MenuButton }
