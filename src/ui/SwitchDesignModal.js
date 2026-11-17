const m = require('mithril')

const Design = require('../Design')
const Icon = require('./Icon')

const FEEDBACK_FORM = 'https://forms.gle/BDq418uAvcG22Rzt7'

const reducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Shown before switching from the redesign back to the classic UI: asks for
// feedback and links to the feedback survey. attrs: onclose
const SwitchDesignModal = {
  oncreate (vnode) {
    vnode.state.onKeyDown = e => {
      if (e.key === 'Escape') {
        vnode.attrs.onclose()
        m.redraw()
      }
    }
    document.addEventListener('keydown', vnode.state.onKeyDown)
    const stay = vnode.dom.querySelector('.stay-button')
    if (stay) stay.focus()
  },
  onbeforeremove (vnode) {
    vnode.dom.classList.add('closing')
    return new Promise(resolve => setTimeout(resolve, reducedMotion() ? 0 : 180))
  },
  onremove (vnode) {
    document.removeEventListener('keydown', vnode.state.onKeyDown)
  },
  view (vnode) {
    const { onclose } = vnode.attrs

    return m('.modal-backdrop', {
      onclick: e => {
        if (e.target === e.currentTarget) onclose()
      }
    }, m('.modal.switch-design[role=dialog][aria-modal=true][aria-labelledby=switch-design-title]', [
      m('.modal-title-row', [
        m('h2#switch-design-title.modal-title', 'Before you switch back'),
        m('button.icon-button.plain.close-button[type=button]', {
          'aria-label': 'Close',
          onclick: onclose
        }, m(Icon, { name: 'x' }))
      ]),
      m('p.switch-design-body', 'Do you have feedback on the new design? Tell us what you liked or what didn’t work for you in a quick survey, and we’ll use it to make bell better.'),
      m(`a.feedback-link[href=${FEEDBACK_FORM}][target=_blank][rel=noopener]`, [
        m('span', 'Share feedback'),
        m('span.feedback-link-arrow[aria-hidden=true]', '↗')
      ]),
      m('.card-actions', [
        m('button.button.secondary.stay-button[type=button]', { onclick: onclose }, 'Keep the new design'),
        m('button.button.primary[type=button]', { onclick: () => Design.switchTo('classic') }, 'Switch to classic')
      ])
    ]))
  }
}

module.exports = SwitchDesignModal
