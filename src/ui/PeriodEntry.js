const m = require('mithril')

const requestManager = require('../RequestManager2').default
const Icon = require('./Icon')

const reducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Modal for renaming a school's blocks (e.g. "Period 3" -> "Chemistry").
// attrs: source, cookieManager, onclose
const BlockNames = {
  oninit (vnode) {
    requestManager.get(`/api/data/${vnode.attrs.source}/meta`).then(meta => {
      vnode.state.meta = meta
      m.redraw()
    })
  },
  oncreate (vnode) {
    vnode.state.onKeyDown = e => {
      if (e.key === 'Escape') {
        vnode.attrs.onclose()
        m.redraw()
      }
    }
    document.addEventListener('keydown', vnode.state.onKeyDown)
  },
  onbeforeremove (vnode) {
    vnode.dom.classList.add('closing')
    return new Promise(resolve => setTimeout(resolve, reducedMotion() ? 0 : 180))
  },
  onremove (vnode) {
    document.removeEventListener('keydown', vnode.state.onKeyDown)
  },
  view (vnode) {
    const { cookieManager, onclose } = vnode.attrs
    const meta = vnode.state.meta
    const names = cookieManager.get('periods', {})
    const update = (period, value) => {
      const periods = cookieManager.get('periods', {})
      periods[period] = value
      cookieManager.set('periods', periods)
    }

    return m('.modal-backdrop', {
      onclick: e => {
        if (e.target === e.currentTarget) onclose()
      }
    }, m('.modal.block-names[role=dialog][aria-modal=true][aria-labelledby=block-names-title]', [
      m('.modal-title-row', [
        m('h2#block-names-title.modal-title', 'Customize block names'),
        m('button.icon-button.plain.close-button[type=button]', {
          'aria-label': 'Close',
          onclick: onclose
        }, m(Icon, { name: 'x' }))
      ]),
      m('p.caption.block-names-intro', meta
        ? `Rename your class blocks at ${meta.name} so your schedule matches your real day.`
        : 'Loading…'),
      meta ? m('.period-list', (meta.periods || []).map(period =>
        m('.period-row', { key: period }, [
          m('label.period-label', { for: `period-${period}` }, period),
          m('input.text-input[type=text][maxlength=20]', {
            id: `period-${period}`,
            placeholder: period,
            value: names[period] || '',
            oninput: e => update(period, e.target.value)
          })
        ])
      )) : null
    ]))
  }
}

module.exports = BlockNames
