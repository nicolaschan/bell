const m = require('mithril')

// Two-option toggle between the redesign and the original UI, shown on the
// timer page of both. attrs: current ('new' | 'classic'), onselect(design)
const OPTIONS = [['new', 'New'], ['classic', 'Classic']]

const DesignToggle = {
  view (vnode) {
    const { current, onselect, className = '' } = vnode.attrs
    return m('.design-toggle[role=group][aria-label=Design]', { className }, [
      m('span.design-toggle-label', 'Design'),
      OPTIONS.map(([design, label]) => m('button[type=button]', {
        'aria-pressed': design === current ? 'true' : 'false',
        onclick: () => {
          if (design !== current) onselect(design)
        }
      }, label))
    ])
  }
}

module.exports = DesignToggle
