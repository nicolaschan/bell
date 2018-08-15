const m = require('mithril')

const cookieManager = require('../LocalForageCookieManager').default
const requestManager = require('../RequestManager2').default
const sourceManager = require('../SourceManager').default
const ThemeManager = require('../ThemeManager').default
const themeManager = new ThemeManager()

const $ = require('jquery')
require('selectize')

const Settings = {
  onupdate: function (vnode) {
    var source = sourceManager.source
    if (source === vnode.state.previousSource) {
      return
    }
    if (source === 'custom') {
      vnode.state.editClasses = true
      m.redraw()
    } else {
      vnode.state.editClasses = true
      requestManager.get(`/api/data/${source}/meta`).then(meta => {
        vnode.state.editClasses = !meta.periods
        m.redraw()
      })
    }
    vnode.state.previousSource = source
  },
  view: function (vnode) {
    document.title = 'Settings'
    return [
      m('.header', m('h1', 'Settings')),
      m('.settings-section', [
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
        m('span',
          m('label.control.control--checkbox', [
            m('input.checkbox[type=checkbox]', {
              onclick: m.withAttr('checked', checked => {
                cookieManager.set('title_period', checked)
              }),
              checked: cookieManager.get('title_period', true)
            }),
            m('.control__indicator'),
            m('span', 'Show period name in page title')
          ])),

        m('.footer-right[style=position: fixed;]', m('a[href=javascript:void(0);]', {
          onclick: () => {
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
        requestManager.get(`/api/sources`).then(callback)
      },
      preload: true,
      render: {
        item: (item, escape) => `<div><b>${escape(item.name)}</b> (${escape(item.id)})</div>`,
        option: (item, escape) => `<div><b>${escape(item.name)}</b> (${escape(item.id)})</div>`
      },
      onChange: (value) => {
        sourceManager.source = value
        m.redraw()
      },
      onLoad: data => {
        if (!hasLoaded) {
          sourceSelector[0].selectize.setValue(sourceManager.source)
          hasLoaded = true
        }
      }
    })

    var themeSelector = $('select#theme').selectize({
      valueField: 'name',
      searchField: ['name'],
      value: cookieManager.get('theme', 'Default - Light'),
      options: (themeManager.availableThemes)
        .map(x => { return {name: x} }),
      render: {
        item: (item, escape) => `<div><b>${escape(item.name)}</b></div>`,
        option: (item, escape) => `<div><b>${escape(item.name)}</b></div>`
      },
      onChange: (value) => {
        cookieManager.set('theme', value)
      }
    })
    themeSelector[0].selectize.setValue(cookieManager.get('theme', 'Default - Light'))
  }
}

module.exports = Settings
