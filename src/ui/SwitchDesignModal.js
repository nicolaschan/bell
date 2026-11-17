const m = require('mithril')

const Design = require('../Design')
const Icon = require('./Icon')

const CONTACT_EMAIL = 'hello@bell.plus'

const reducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Shown before switching from the redesign back to the classic UI: asks for
// feedback and shows the contact email. attrs: onclose
const SwitchDesignModal = {
  oninit (vnode) {
    vnode.state.copied = false
  },
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
    const state = vnode.state
    const copy = e => {
      const done = () => {
        state.copied = true
        m.redraw()
        setTimeout(() => { state.copied = false; m.redraw() }, 2000)
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(CONTACT_EMAIL).then(done, () => selectEmail(e))
      } else {
        selectEmail(e)
      }
    }
    const selectEmail = e => {
      const text = e.currentTarget.closest('.modal').querySelector('.feedback-email-text')
      const range = document.createRange()
      range.selectNodeContents(text)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
    }

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
      m('p.switch-design-body', 'Do you have feedback on the new design? Tell us what you liked or what didn’t work for you, and we’ll use it to make bell better.'),
      m('.feedback-email', [
        m(Icon, { name: 'mail' }),
        m(`a.feedback-email-text[href=mailto:${CONTACT_EMAIL}]`, CONTACT_EMAIL),
        m('button.button.secondary.copy-button[type=button]', { onclick: copy }, state.copied ? 'Copied' : 'Copy')
      ]),
      m('.card-actions', [
        m('button.button.secondary.stay-button[type=button]', { onclick: onclose }, 'Keep the new design'),
        m('button.button.primary[type=button]', { onclick: () => Design.switchTo('classic') }, 'Switch to classic')
      ])
    ]))
  }
}

module.exports = SwitchDesignModal
