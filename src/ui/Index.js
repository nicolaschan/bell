const m = require('mithril')

const Appearance = require('../Appearance')
const Pie = require('./Pie')
const Icon = require('./Icon')
const Popup = require('./Popup')
const Settings = require('./Settings')
const BlockNames = require('./PeriodEntry')
const ScheduleView = require('./ScheduleView')
const favicon = require('./favicon')
const { Dropdown, MenuSeparator, MenuButton } = require('./Dropdown')
const { default: ErrorIcon } = require('./ErrorIcon')
const Loading = require('./Loading').default
const { formatDateTime } = require('./format')

const SimpleLogger = require('../SimpleLogger').default
const logger = new SimpleLogger()
const AnalyticsManager = require('../AnalyticsManager2').default
const analyticsManager = new AnalyticsManager(logger)

const EDITOR_URL = 'https://edit.bell.plus'

// Pages such as /settings can ask the timer to open with a panel showing
let pendingPanel = null
const openTimerWith = panel => { pendingPanel = panel }

const SchoolMenu = {
  view (vnode) {
    const { name, isCustom } = vnode.attrs
    return m(Dropdown, {
      className: 'school-menu',
      trigger: ({ open, toggle }) => m('button.school-select[type=button]', {
        'aria-haspopup': 'menu',
        'aria-expanded': open ? 'true' : 'false',
        onclick: toggle
      }, [
        m(Icon, { name: 'bell-symbol', width: 24.931, height: 24.605 }),
        m('span.school-name', name),
        m(Icon, { name: 'chevron-down', size: 16 })
      ]),
      menu: () => isCustom ? [
        m('.menu-header', [
          m('.menu-header-title', 'Your personal schedule'),
          m('a.link[href=/home]', { oncreate: m.route.link }, 'Switch to a different schedule')
        ]),
        m(MenuSeparator),
        m(MenuButton, { icon: 'mail', href: '/contact' }, 'Contact us')
      ] : [
        m('.menu-header', [
          m('.menu-header-title', name),
          m('a.not-you[href=/home]', { oncreate: m.route.link }, [
            'Not you? ', m('span.link', 'View a different schedule')
          ])
        ]),
        m(MenuSeparator),
        m(MenuButton, { icon: 'calendar', href: '/classes' }, 'Use a personal schedule'),
        m(MenuSeparator),
        m(MenuButton, { icon: 'mail', href: '/contact' }, 'Contact us'),
        m(MenuSeparator),
        m(MenuButton, { icon: 'log-in', href: EDITOR_URL, external: true }, 'Log in to update school schedule')
      ]
    })
  }
}

const SoundNotice = {
  view (vnode) {
    const soundManager = vnode.attrs.soundManager
    if (!soundManager.isEnabled() || soundManager.getHasInteracted()) {
      return null
    }
    return m('button.pill-notice[type=button]', {
      onclick: () => soundManager.reportInteraction()
    }, [m(Icon, { name: 'volume', size: 16 }), 'Click to enable sound'])
  }
}

// Shift the countdown so the colon sits on the pie's 12 o'clock edge (the
// horizontal center of the hero). With hours (H:MM:SS) the middle group is
// centered on the edge instead.
const alignToPie = vnode => {
  const el = vnode.dom
  const hero = el.parentNode
  const colons = el.querySelectorAll('.time .colon')
  if (!hero || colons.length === 0) return
  const current = vnode.state.shift || 0
  let anchor
  if (colons.length === 1) {
    const r = colons[0].getBoundingClientRect()
    anchor = r.left + r.width / 2
  } else {
    anchor = (colons[0].getBoundingClientRect().right + colons[1].getBoundingClientRect().left) / 2
  }
  const heroRect = hero.getBoundingClientRect()
  const target = heroRect.left + heroRect.width / 2
  // Keep the block on screen on narrow windows
  const elRect = el.getBoundingClientRect()
  let shift = Math.round(current + target - anchor)
  const naturalLeft = elRect.left - current
  shift = Math.max(heroRect.left - naturalLeft, Math.min(shift, heroRect.right - (naturalLeft + elRect.width)))
  if (shift !== current) {
    vnode.state.shift = shift
    el.style.transform = `translateX(${shift}px)`
  }
}

const Countdown = {
  oncreate: alignToPie,
  onupdate: alignToPie,
  view (vnode) {
    const { bellTimer, notificationManager, soundManager, periodInTitle } = vnode.attrs
    const time = bellTimer.getTimeRemainingString()
    const period = bellTimer.getCurrentPeriod().name
    // Personal schedules are named after the weekday, which isn't worth repeating
    const schedule = vnode.attrs.source === 'custom' ? null : bellTimer.getCurrentSchedule().display

    if (bellTimer.displayPeriodNotification()) {
      notificationManager.sendNotification(period, `Starting now with ${time} remaining`)
      soundManager.playSound()
    }
    document.title = periodInTitle ? `${time} | ${period}` : time
    favicon.update(time)

    return m('.countdown', [
      m('.time', { 'aria-label': time }, time.split(':').map((group, i) => [
        i > 0 ? m('span.colon', ':') : null,
        m('span.group', group)
      ])),
      m('.period', period),
      schedule ? m('.schedule-name', schedule) : null
    ])
  }
}

const EmptyPersonalSchedule = {
  view () {
    return m('.empty-state', [
      m('p.empty-title', 'Your schedule is empty'),
      m('img', {
        src: `/img/redesign/${Appearance.darkMode ? 'empty-schedule-dark' : 'empty-schedule'}.png`,
        width: 204,
        height: 215,
        alt: ''
      }),
      m('p.empty-body', 'Add your classes to stay organized throughout the day.'),
      m('a.button.primary[href=/classes]', { oncreate: m.route.link }, 'Build schedule')
    ])
  }
}

// Seasonal effects (snow in December, the April Fools duck) from the original themes
const SeasonalEffects = {
  view (vnode) {
    const effects = vnode.attrs.themeManager.defaultTheme.specialEffects
    if (!effects) {
      return null
    }
    const draw = v => {
      const c = v.dom
      c.width = window.innerWidth
      c.height = window.innerHeight
      effects(c.getContext('2d'), c)
    }
    return m('canvas.seasonal-effects', { oncreate: draw, onupdate: draw })
  }
}

const Index = {
  oninit: async function (vnode) {
    const cookieManager = vnode.attrs.cookieManager
    vnode.state.panel = pendingPanel
    pendingPanel = null

    vnode.attrs.notificationManager = require('../NotificationManager').default
    vnode.attrs.soundManager = require('../SoundManager').default
    const ThemeManager = require('../ThemeManager').default
    vnode.attrs.themeManager = new ThemeManager()
    const sourceManager = require('../SourceManager').default
    sourceManager.source = vnode.attrs.source
    const BellTimer = require('../BellTimer2').default
    const SynchronizedDate = require('../SynchronizedDate').default
    const CorrectedDate = require('../CorrectedDate').default
    const bellTimer = new BellTimer(
      sourceManager.source,
      new CorrectedDate(new SynchronizedDate()),
      cookieManager.get('periods', {}),
      cookieManager.get('courses', {}))
    global.bellTimer = bellTimer
    vnode.attrs.bellTimer = bellTimer
    vnode.attrs.periodInTitle = cookieManager.get('title_period', true)
    const ChromeExtensionMessenger = require('../ChromeExtensionMessenger')
    const chromeExtensionMessenger = new ChromeExtensionMessenger()
    // CHANGE THIS FOR LOCAL TESTING TO THE ID FOUND IN CHROME://EXTENSIONS
    chromeExtensionMessenger.connect('pkeeekfbjjpdkbijkjfljamglegfaikc')
    try {
      await bellTimer.initialize()

      // Will only get to here if the source is valid
      // Report analytics here since we have a valid source
      // If there is an invalid source, it will be reset
      // in the following catch block and we'll run again in
      // the next load.
      // TODO: Move this somewhere that makes more sense
      await analyticsManager.reportAnalytics()
    } catch (e) {
      await sourceManager.clearSource()
      vnode.attrs.error = [m('span', 'School not found'), m('br'), m('a[href=/home]', {
        oncreate: m.route.link
      }, 'Try another')]
    }
  },
  view: function (vnode) {
    const attrs = vnode.attrs
    const bellTimer = attrs.bellTimer
    Appearance.apply()

    if (!bellTimer || !bellTimer.initialized) {
      if (attrs.error) {
        return m(ErrorIcon, attrs.error)
      }
      return m(Loading, 'Synchronizing')
    }

    const isCustom = attrs.source === 'custom'
    const hasCourses = Object.keys(attrs.cookieManager.get('courses', {})).length > 0
    const meta = bellTimer.meta || {}
    const name = isCustom ? 'Your personal schedule' : (meta.name || attrs.source)
    const theme = Appearance.theme
    // On days without classes the page takes the theme color and the pie takes
    // the page color (cream in light mode, near-black in dark mode)
    // (An empty personal schedule keeps the normal page; it shows its own empty state.)
    const noClasses = !(isCustom && !hasCourses) && !ScheduleView.hasClassesToday(bellTimer)
    const pieTheme = noClasses ? { stops: [Appearance.pageColor()] } : theme
    const setPanel = panel => () => { vnode.state.panel = panel }

    return m('.timer-page', {
      className: [noClasses ? 'no-classes' : '', noClasses && theme.type === 'dynamic' ? 'dynamic' : ''].join(' ')
    }, [
      m('header.page-header', [
        m(SchoolMenu, { name, isCustom }),
        m('nav.header-actions', [
          m('button.icon-button.settings-button[type=button]', {
            'aria-label': 'Settings',
            title: 'Settings',
            onclick: setPanel('settings')
          }, m(Icon, { name: 'settings', size: 36 })),
          isCustom && hasCourses ? m('a.icon-button.bordered[href=/classes]', {
            'aria-label': 'Edit your schedule',
            title: 'Edit your schedule',
            oncreate: m.route.link
          }, m(Icon, { name: 'edit' })) : null,
          isCustom && !hasCourses ? null : m('button.button.primary[type=button]', {
            onclick: setPanel('schedule')
          }, 'View schedule')
        ])
      ]),
      m('main.hero', isCustom && !hasCourses ? m(EmptyPersonalSchedule) : [
        m(Pie, {
          proportionElapsed: bellTimer.getProportionElapsed(),
          theme: pieTheme,
          passing: !noClasses && ScheduleView.isBreak(bellTimer.getCurrentPeriod().name)
        }),
        m(Countdown, attrs)
      ]),
      m('footer.page-footer', [
        m('.header-title', formatDateTime(bellTimer.date)),
        m('.footer-notices', [
          m(SoundNotice, attrs),
          m(Popup, attrs)
        ])
      ]),
      m(SeasonalEffects, attrs),
      vnode.state.panel === 'schedule' ? m(ScheduleView, { bellTimer, onclose: setPanel(null) }) : null,
      vnode.state.panel === 'settings' ? m(Settings, {
        onclose: setPanel(null),
        oncustomize: setPanel('customize'),
        showCustomize: !isCustom && Array.isArray(meta.periods) && meta.periods.length > 0
      }) : null,
      vnode.state.panel === 'customize' ? m(BlockNames, {
        source: attrs.source,
        cookieManager: attrs.cookieManager,
        onclose: () => {
          // Apply the new names to the running countdown
          bellTimer.bindings = attrs.cookieManager.get('periods', {})
          bellTimer.reloadData().then(() => m.redraw(), () => {})
          vnode.state.panel = null
        }
      }) : null
    ])
  },
  onremove: function (vnode) {
    if (vnode.attrs.bellTimer) {
      vnode.attrs.bellTimer.stopRefreshing()
    }
  }
}

Index.openTimerWith = openTimerWith

module.exports = Index
