const m = require('mithril')

// "New design" switch on the timer page of both the redesign (on) and the
// original UI (off). attrs: current ('new' | 'classic'), onselect(design)
const DesignToggle = {
  view (vnode) {
    const { current, onselect, className = '' } = vnode.attrs
    const on = current === 'new'
    return m('label.design-toggle', { className }, [
      m('span.design-toggle-label', 'New design'),
      m('button[type=button][role=switch]', {
        'aria-checked': on ? 'true' : 'false',
        'aria-label': 'New design',
        onclick: () => onselect(on ? 'classic' : 'new')
      }, m('img', {
        // A grey "on" state, softer than the black switches in Settings
        src: `/img/redesign/toggle-${on ? 'on-grey' : 'off'}.svg`,
        width: 35,
        height: 21,
        alt: ''
      }))
    ])
  }
}

module.exports = DesignToggle
