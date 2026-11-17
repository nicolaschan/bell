const m = require('mithril')

const Appearance = require('../Appearance')
const requestManager = require('../RequestManager2').default
const Icon = require('./Icon')

// Rename a school's periods (e.g. "Period 3" -> "Chemistry") or mark them as free
const PeriodEntry = {
  oninit: function (vnode) {
    const source = vnode.attrs.cookieManager.get('source')
    vnode.state.source = source
    requestManager.get(`/api/data/${source}/meta`).then(meta => {
      vnode.state.meta = meta
      m.redraw()
    })
  },
  view: function (vnode) {
    Appearance.apply()
    document.title = 'Customize block names'
    const cookieManager = vnode.attrs.cookieManager
    const meta = vnode.state.meta
    const names = cookieManager.get('periods', {})
    const update = (period, value) => {
      const periods = cookieManager.get('periods', {})
      periods[period] = value
      cookieManager.set('periods', periods)
    }

    return m('.builder-page', [
      m('header.page-header.builder-header', [
        m('.builder-heading', [
          m('h1.header-title', 'Customize block names'),
          m('p.header-subtitle', meta
            ? `Rename your class blocks at ${meta.name} so your schedule matches your real day.`
            : 'Loading…')
        ]),
        m('a.icon-button.plain.close-button', {
          href: `/${vnode.state.source}`,
          'aria-label': 'Done, back to timer',
          title: 'Back to timer',
          oncreate: m.route.link
        }, m(Icon, { name: 'close', size: 28 }))
      ]),
      m('main.builder-content', meta ? m('.card.period-card', (meta.periods || []).map(period =>
        m('.period-row', { key: period }, [
          m('label.period-label', { for: `period-${period}` }, period),
          m('input.text-input[type=text][maxlength=20]', {
            id: `period-${period}`,
            placeholder: period,
            value: names[period] || '',
            oninput: e => update(period, e.target.value)
          })
        ])
      )) : null)
    ])
  }
}

module.exports = PeriodEntry
