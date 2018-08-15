const m = require('mithril')
const $ = require('jquery')

const ScheduleDisplay = require('./ScheduleDisplay')
const Page1 = require('./Page1')
const Popup = require('./Popup')
const SchoolIndicator = require('./SchoolIndicator')
const Loading = require('./Loading').default
const SettingsIcon = require('./SettingsIcon').default
const ScrollArrow = require('./ScrollArrow').default

const Index = {
  oninit: async function (vnode) {
    const cookieManager = vnode.attrs.cookieManager
    if (!cookieManager.get('has_scrolled')) {
      $(window).on('scroll', function (e) {
        if ($(window).scrollTop() > 250) {
          $(window).off('scroll')
          cookieManager.set('has_scrolled', true)
        }
      })
    }
    const ThemeManager = require('../ThemeManager').default
    vnode.attrs.themeManager = new ThemeManager(vnode.attrs.cookieManager.get('theme'))
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
    vnode.attrs.bellTimer = bellTimer
    vnode.attrs.cookieManager = cookieManager
    vnode.attrs.periodInTitle = cookieManager.get('title_period', true)
    const ChromeExtensionMessenger = require('../ChromeExtensionMessenger')
    const chromeExtensionMessenger = new ChromeExtensionMessenger()
    // CHANGE THIS FOR LOCAL TESTING TO THE ID FOUND IN CHROME://EXTENSIONS
    chromeExtensionMessenger.connect('pkeeekfbjjpdkbijkjfljamglegfaikc')
    try {
      await bellTimer.initialize()
    } catch (e) {
      await sourceManager.clearSource()
      m.route.set('/') // School data not available
    }
  },
  view: function (vnode) {
    if (!vnode.attrs.bellTimer || !vnode.attrs.bellTimer.initialized) {
      return m(Loading, 'Synchronizing')
    }
    return [
      m('span', {
        style: {
          'font-size': (Math.min(window.innerHeight * 0.3, window.innerWidth * 0.2) * 0.1) + 'px'
        }
      }, [
        m(Page1, vnode.attrs),
        m('.container#page2', [
          m(ScheduleDisplay, vnode.attrs),
          m(SettingsIcon)
        ])
      ]),
      m(Popup, vnode.attrs),
      m(SchoolIndicator, vnode.attrs, (vnode.attrs.bellTimer.meta || {}).name || ''),
      m(ScrollArrow, { visible: vnode.attrs.cookieManager.get('has_scrolled') })
    ]
  },
  onremove: function (vnode) {
    vnode.attrs.bellTimer.stopRefreshing()
  }
}

module.exports = Index
