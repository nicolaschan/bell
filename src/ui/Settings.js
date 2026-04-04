const m = require('mithril')

const cookieManager = require('../LocalForageCookieManager').default
const requestManager = require('../RequestManager2').default
const sourceManager = require('../SourceManager').default
const notificationManager = require('../NotificationManager').default
const soundManager = require('../SoundManager').default
const ThemeManager = require('../ThemeManager').default
const themeManager = new ThemeManager()
const scheduleOverrideManager = require('../ScheduleOverrideManager').default
const parseSchedules = require('../ScheduleParser').default
const { Select } = require('mithril-selector')

function containsCurrentSource (sources, currentSource) {
  for (let source of sources) {
    if (source.value === currentSource) {
      return true
    }
  }
  return false
}

const Settings = {
  oninit: async function (vnode) {
    vnode.state.sources = (await requestManager.get('/api/sources'))
      .map(source => ({
        display: `${source.name} (${source.id})`,
        value: source.id
      }))

    if (!containsCurrentSource(vnode.state.sources, sourceManager.source)) {
      const currentSchool = await requestManager.get(`/api/data/${sourceManager.source}/meta`)
      vnode.state.sources.push({
        display: currentSchool.name,
        value: sourceManager.source
      })
    }

    // Load available schedules for override
    try {
      const source = sourceManager.source
      const data = await requestManager.get(`/api/data/${source}`)
      const parsedSchedules = parseSchedules(data.schedules)
      vnode.state.availableSchedules = Object.keys(parsedSchedules)
        .filter(name => parsedSchedules[name].periods.length > 0) // Filter out empty schedules like weekend/holiday
        .map(name => ({
          display: parsedSchedules[name].display || name,
          value: name
        }))
        .sort((a, b) => a.display.localeCompare(b.display))
      
      // Check if there's an override for today
      await scheduleOverrideManager.waitForCache()
      const override = scheduleOverrideManager.getTodayOverride()
      vnode.state.currentOverride = override ? override.scheduleName : null
      // pendingOverride is set when the user changes the selector but hasn't saved
      vnode.state.pendingOverride = undefined
    } catch (e) {
      vnode.state.availableSchedules = []
    }
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
          m('small'), '(No guarantee of correctness. Check with school for official schedules.)']),
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
        // Schedule override selector
        (vnode.state.availableSchedules && vnode.state.availableSchedules.length > 0) ? [
          m('.desc', [
            'Override Today\'s Schedule (Local Only)',
            m('br'),
            m('small', 'If your schedule ')
          ]),
          m(Select, {
            value: (vnode.state.pendingOverride !== undefined) ? vnode.state.pendingOverride : (vnode.state.currentOverride ? vnode.state.currentOverride : '__default__'),
            options: [{ display: '-- Use Default Schedule --', value: '__default__' }].concat(vnode.state.availableSchedules),
            onselect: (scheduleName) => {
              // Don't apply immediately — let the user Save using the done button
              vnode.state.pendingOverride = scheduleName
              m.redraw()
            }
          }),
        ] : null,
        m('.add-link', (vnode.state.editClasses) ? null : m('a.add#edit-classes-button[href=/periods]', {
          oncreate: m.route.link
        }, 'Edit Period Names')),
        m('.add-link', m('a.add#edit-classes-button[href=https://edit.bell.plus]', 'Create Shared Schedule')),
        m('.add-link', m('a.add#edit-classes-button[href=/classes]', {
          oncreate: m.route.link
        }, (vnode.state.editClasses ? 'Edit' : 'Use') + ' Custom Schedule (private)')),
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
                ? `Notifications not available (please allow in your browser and refresh if you want them) (${window.Notification.permission})` : 'Send notification when bell rings')
            ])),
          m('span',
            m('label.control.control--checkbox', [
              m('input.checkbox[type=checkbox]', {
                onclick: m.withAttr('checked', soundManager.setEnabled),
                checked: soundManager.isEnabled()
              }),
              m('.control__indicator'),
              m('span', 'Play sound when bell rings')
            ])
          )),

        m('.footer-right[style=position: fixed;]', m('a[href=javascript:void(0);]', {
          onclick: async () => {
            try {
              if (vnode.state.pendingOverride !== undefined) {
                if (vnode.state.pendingOverride === '__default__') {
                  await scheduleOverrideManager.clearOverrideForToday()
                  vnode.state.currentOverride = null
                } else {
                  await scheduleOverrideManager.setOverrideForToday(vnode.state.pendingOverride)
                  vnode.state.currentOverride = vnode.state.pendingOverride
                }
                vnode.state.pendingOverride = undefined
                if (global && global.bellTimer && global.bellTimer.reloadData) {
                  try { await global.bellTimer.reloadData() } catch (e) { /* ignore */ }
                }
              }
            } finally {
              m.route.set('/')
            }
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
