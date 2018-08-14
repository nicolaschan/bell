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
      if (!vnode.attrs.cookieManager.initialized) {
        return m(Loading, 'Loading')
      }
      return m(element, vnode.attrs)
    }
  }
}

class MithrilUI {
  constructor () {
    m.route.prefix('')
    m.route(root, '/', {
      '/': withCookies({
        oninit: function (vnode) {
          const sourceManager = require('./SourceManager').default
          m.route.set(`/${sourceManager.source}`)
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
