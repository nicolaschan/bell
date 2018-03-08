const m = require('mithril')

const $ = require('jquery')
require('selectize')

const Settings = {
  onupdate: function (vnode) {
    var source = vnode.attrs.uiModel.bellTimer.source
    if (source === vnode.state.previousSource) {
      return
    }
    if (source === 'custom') {
      vnode.state.editClasses = true
      m.redraw()
    } else {
      vnode.state.editClasses = true
      vnode.attrs.uiModel.requestManager.get(`/api/data/${source}/meta`).then(meta => {
        vnode.state.editClasses = !meta.periods
        m.redraw()
      })
    }
    vnode.state.previousSource = source
  },
  view: function (vnode) {
    return [
      m('.header', m('h1', 'Settings')),
      m('div[style=margin:1em auto;width:24em;]', [
        m('.desc', [
          'Schedule source or Custom',
          m('br'),
          '(No guarantee of correctness. Check with school for official schedules.)']),
        m('select#source[placeholder=Schedule source]'),
        m('.desc', 'Theme'),
        m('select#theme[placeholder=Theme]'),
        m('.add-link', (vnode.state.editClasses) ? m('a.add#edit-classes-button[href=/classes]', {
          oncreate: m.route.link
        }, 'Edit Classes') : m('a.add#edit-classes-button[href=/periods]', {
          oncreate: m.route.link
        }, 'Edit Periods')),
        m('.add-link', m('a.add#edit-classes-button[href=https://goo.gl/forms/LQumv10P4NY3jRf92]', 'Request School')),
        m('.add-link', m('a.add#edit-classes-button[href=https://goo.gl/forms/HgyL96yycOKKT0w22]', 'Report Problem')),
        m('.footer-right[style=position: fixed;]', m('a[href=javascript:void(0);]', {
          onclick: () => {
            vnode.attrs.uiModel.bellTimer.reloadData()
            m.route.set('/')
          }
        }, m('i.done-icon.icon.material-icons', 'done'))),
        m('.footer-left[style=position: fixed;]', [m('a[style=margin-right: 2em;]', {
          href: 'https://countdown.zone/about'
        }, 'About'),
        m('a', {
          href: '/xt'
        }, 'Chrome Extension')])
      ])
    ]
  },
  oncreate: function (vnode) {
    var hasLoaded = false
    var sourceSelector = $('select#source').selectize({
      valueField: 'id',
      searchField: ['name', 'id'],
      options: [],
      // create: (input) => {
      //   var split = input.split(':')
      //   return {
      //     name: split[split.length - 1],
      //     id: input
      //   }
      // },
      load: (query, callback) => {
        vnode.attrs.uiModel.requestManager.get(`/api/sources?query=${query}`).then(callback)
      },
      preload: true,
      render: {
        item: (item, escape) => `<div><b>${escape(item.name)}</b> (${escape(item.id)})</div>`,
        option: (item, escape) => `<div><b>${escape(item.name)}</b> (${escape(item.id)})</div>`
      },
      onChange: (value) => {
        vnode.attrs.uiModel.bellTimer.source = value
        m.redraw()
      },
      onLoad: data => {
        if (!hasLoaded) {
          sourceSelector[0].selectize.setValue(vnode.attrs.uiModel.cookieManager.get('source', 'lahs'))
          hasLoaded = true
        }
      }
    })

    var themeSelector = $('select#theme').selectize({
      valueField: 'name',
      searchField: ['name'],
      value: vnode.attrs.uiModel.themeManager.currentThemeName,
      options: (Object.keys(vnode.attrs.uiModel.themeManager.availableThemes))
        .map(x => { return {name: x} }),
      render: {
        item: (item, escape) => `<div><b>${escape(item.name)}</b></div>`,
        option: (item, escape) => `<div><b>${escape(item.name)}</b></div>`
      },
      onChange: (value) => {
        vnode.attrs.uiModel.themeManager.currentThemeName = value
      }
    })
    themeSelector[0].selectize.setValue(vnode.attrs.uiModel.themeManager.currentThemeName)
  }
}

module.exports = Settings
