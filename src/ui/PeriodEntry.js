const m = require('mithril')

const PeriodEntry = {
  oninit: function (vnode) {
    var source = vnode.attrs.uiModel.cookieManager.get('source')
    vnode.attrs.uiModel.requestManager.get(`/api/data/${source}/meta`).then(meta => {
      vnode.state.meta = meta
      vnode.state.enabled = {}
      for (let period in vnode.attrs.uiModel.cookieManager.get('periods', {})) {
        vnode.state.enabled[period] = vnode.attrs.uiModel.cookieManager.get('periods', {})[period] !== 'Free'
      }
    })
  },
  view: function (vnode) {
    return [
      m('.header', m('h1', (vnode.state.meta) ? vnode.state.meta.name : 'Customize Periods')),
      m('[style=margin 1em auto;text-align: center;]',
        m('table#scheduleEntryTable[style=margin: 1em auto;]', (vnode.state.meta ? vnode.state.meta.periods : []).map(period =>
          m('tr', [
            m('td.tableLabel', period),
            m('td.tableInput', m('input.inputBox[type=text]', {
              placeholder: period,
              maxlength: '20',
              value: vnode.attrs.uiModel.cookieManager.get('periods', {})[period],
              oninput: m.withAttr('value', input => {
                var periods = vnode.attrs.uiModel.cookieManager.get('periods', {})
                periods[period] = input
                vnode.attrs.uiModel.cookieManager.set('periods', periods)
              }),
              disabled: !((vnode.state.enabled) ? vnode.state.enabled[period] : false)
            })),
            m('td.tableCheckbox',
              m('label.control.control--checkbox', [
                m('input.checkbox[type=checkbox]', {
                  onclick: m.withAttr('checked', checked => {
                    var periods = vnode.attrs.uiModel.cookieManager.get('periods', {})
                    periods[period] = checked ? period : 'Free'
                    vnode.attrs.uiModel.cookieManager.set('periods', periods)
                    vnode.state.enabled[period] = checked
                  }),
                  checked: (vnode.state.enabled) ? vnode.state.enabled[period] : false
                }),
                m('.control__indicator')
              ]))
          ])))),
      m('.footer-right[style=position: fixed;]', m('a[href=/settings]', {
        oncreate: m.route.link
      }, m('i.done-icon.icon.material-icons', 'done')))
    ]
  }
}

module.exports = PeriodEntry
