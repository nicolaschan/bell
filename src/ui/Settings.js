const m = require('mithril')

const cookieManager = require('../LocalForageCookieManager').default
const requestManager = require('../RequestManager2').default
const sourceManager = require('../SourceManager').default
const notificationManager = require('../NotificationManager').default
const ThemeManager = require('../ThemeManager').default
const themeManager = new ThemeManager()
const { Select } = require('mithril-selector')

const Settings = {
  oninit: async function (vnode) {
    vnode.state.sources = (await requestManager.get('/api/sources'))
      .map(source => ({
        display: `${source.name} (${source.id})`,
        value: source.id
      }))
  },
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
          'School schedule source',
          m('br'),
          '(No guarantee of correctness. Check with school for official schedules.)']),
        m(Select, {
          value: (vnode.state.sources) ? sourceManager.source : '',
          options: vnode.state.sources || [''],
          onselect: source => { sourceManager.source = source }
        }),
        m('.desc', 'Theme'),
        m(Select, {
          value: new ThemeManager(cookieManager.get('theme')).currentTheme.name,
          options: themeManager.availableThemes,
          onselect: theme => cookieManager.set('theme', theme)
        }),
        m('.add-link', (vnode.state.editClasses) ? m('a.add#edit-classes-button[href=/classes]', {
          oncreate: m.route.link
        }, 'Edit Classes') : m('a.add#edit-classes-button[href=/periods]', {
          oncreate: m.route.link
        }, 'Edit Periods')),
        m('.add-link', m('a.add#edit-classes-button[href=/classes]', 'Insert Custom Schedule')),
        m('.add-link', m('a.add#edit-classes-button[href=https://blog.bell.plus/contact/]', 'Request School or Report Issue')),
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
          ]),
          m('span',
            m('label.control.control--checkbox', [
              m('input.checkbox[type=checkbox]', {
                onclick: m.withAttr('checked', checked => {
                  if (checked) {
                    return notificationManager.enable()
                  } else {
                    return notificationManager.disable()
                  }
                }),
                checked: notificationManager.isEnabled(),
                disabled: notificationManager.notificationsBlocked()
              }),
              m('.control__indicator'),
              m('span', (notificationManager.notificationsBlocked())
                ? `Notifications not available (please allow in your browser if you want them) (${window.Notification.permission})` : 'Send notification when bell rings')
            ]))),

        m('.footer-right[style=position: fixed;]', m('a[href=javascript:void(0);]', {
          onclick: () => {
            m.route.set('/')
          }
        }, m('i.done-icon.icon.material-icons', 'done'))),
        m('.footer-left[style=position: fixed;]', [m('a[style=margin-right: 2em;]', {
          href: 'https://bell.plus/about'
        }, 'About'),
        m('a', {
          href: '/xt'
        }, 'Chrome Extension')])
      ])
    ]
  }
}

module.exports = Settings
