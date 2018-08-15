/* global chrome */

const m = require('mithril')
const root = document.getElementById('root')

const hostname = require('./Hostname').default

var openSettingsTab = function () {
  chrome.tabs.create({
    url: `${hostname}/settings`
  })
}

// Below code is almost all from MithrilUI.js, with some modification
var SchoolIndicator = {
  view: function (vnode) {
    var theme = vnode.attrs.themeManager.currentTheme.theme(vnode.attrs.bellTimer)

    return m('.top.left.popup.school-indicator', m('table', m('tr', [
      m('td', m('a.no-decoration.center-vertical', {
        href: `${hostname}/settings`,
        style: theme.subtext,
        onclick: openSettingsTab
      }, vnode.children))
    ])))
  }
}
var Page1 = require('../../src/ui/Page1')

class ExtUI {
  constructor (uiModel) {
    this.uiModel = uiModel

    m.mount(root, {
      onupdate: async function () {
        if (uiModel.needsUpdate) {
          uiModel.needsUpdate = false
          // Necessary for when cookies are loaded from the website
          const BellTimer = require('../../src/BellTimer2').default
          const ThemeManager = require('../../src/ThemeManager').default
          const RequestManager = require('./ChromeExtensionRequestManager')
          const CorrectedDate = require('../../src/CorrectedDate').default
          const SynchronizedDate = require('../../src/SynchronizedDate').default
          const cookman = uiModel.cookieManager
          var thememan = new ThemeManager(cookman.get('theme'))
          var reqman = new RequestManager(cookman)
          var bellTimer = new BellTimer(
            cookman.get('source', 'lahs'),
            new CorrectedDate(new SynchronizedDate()),
            cookman.get('periods', {}),
            cookman.get('courses', {}),
            reqman)
          await bellTimer.reloadData()
          uiModel.themeManager = thememan
          uiModel.requestManager = reqman
          uiModel.bellTimer = bellTimer
        }
      },
      view: function () {
        if (!uiModel.state.ready) {
          return m('.centered.loading', [
            m('i.material-icons.loading-icon.spin', 'sync'),
            m('br'),
            m('.loading-message', uiModel.state.loadingMessage.value)
          ])
        }
        return [m('span', {
          style: {
            'font-size': (Math.min(window.innerHeight * 0.3, window.innerWidth * 0.2) * 0.1) + 'px'
          }
        }, [m(Page1, {
          model: uiModel,
          bellTimer: uiModel.bellTimer,
          themeManager: uiModel.themeManager
        }), m('.centered'),
        m('.footer-right', m(`a[href=${hostname}/settings]`,
          m('i.settings-icon.material-icons', {
            onclick: openSettingsTab
          }, 'settings')))
        ]), m(SchoolIndicator, {
          bellTimer: uiModel.bellTimer,
          themeManager: uiModel.themeManager
        }, (uiModel.bellTimer.meta || {}).name || '')]
      }
    })
  }

  redraw () {
    m.redraw()
  }
}

module.exports = ExtUI
