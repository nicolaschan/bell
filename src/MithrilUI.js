const m = require('mithril')
const root = document.body

const Index = require('./ui/Index')
const Settings = require('./ui/Settings')
const PeriodEntry = require('./ui/PeriodEntry')
const Classes = require('./ui/Classes')
const Enter = require('./ui/Enter')
const Loading = require('./ui/Loading').default

const withCookies = function (element) {
  return {
    oninit: function (vnode) {
      vnode.attrs.cookieManager = require('./LocalForageCookieManager').default
      vnode.attrs.cookieManager.initialize()
    },
    view: function (vnode) {
      if (vnode.attrs.hasScrolled !== window.location.hash) {
        if (document.getElementById(window.location.hash.substring(1))) {
          document.getElementById(window.location.hash.substring(1)).scrollIntoView({
            behavior: 'auto',
            block: 'start'
          })
          vnode.attrs.hasScrolled = window.location.hash
        }
      }
      if (!vnode.attrs.cookieManager || !vnode.attrs.cookieManager.initialized) {
        // For some reason, after recycling oninit isn't called
        // So sometimes cookieManager is not actually defined
        if (!vnode.attrs.cookieManager) {
          vnode.attrs.cookieManager = require('./LocalForageCookieManager').default
          vnode.attrs.cookieManager.initialize()
        }
        return m(Loading, 'Loading')
      }
      return m(element, vnode.attrs)
    }
  }
}

class MithrilUI {
  constructor () {
    m.route.prefix('', {})
    m.route(root, '/', {
      '/': withCookies({
        oninit: function (vnode) {
          const sourceManager = require('./SourceManager').default
          m.route.set(`/${sourceManager.source}`, null, {
            replace: true
          })
        },
        view: function (vnode) {
          return m('')
        }
      }),
      '/settings': withCookies(Settings),
      '/periods': withCookies(PeriodEntry),
      '/classes': withCookies(Classes),
      '/enter': withCookies(Enter),
      '/:source': withCookies(Index)
    })
  }

  redraw () {
    m.redraw()
  }
}

module.exports = MithrilUI
