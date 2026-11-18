// The original bell.plus UI, kept so people can switch back from the redesign
const m = require('mithril')
const root = document.body

const Index = require('./Index')
const Settings = require('./Settings')
const PeriodEntry = require('./PeriodEntry')
const Classes = require('./Classes')
const Enter = require('./Enter')
const Loading = require('./Loading').default

const withCookies = function (element) {
  return {
    oninit: function (vnode) {
      vnode.attrs.cookieManager = require('../../LocalForageCookieManager').default
      vnode.attrs.cookieManager.initialize()
    },
    view: function (vnode) {
      if (vnode.attrs.hasScrolled !== window.location.hash) {
        const hash = window.location.hash.substring(1)
        if (hash && document.getElementById(hash)) {
          document.getElementById(hash).scrollIntoView({
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
          vnode.attrs.cookieManager = require('../../LocalForageCookieManager').default
          vnode.attrs.cookieManager.initialize()
        }
        return m(Loading, 'Loading')
      }
      return m(element, vnode.attrs)
    }
  }
}

const ExternalPage = url => ({
  oninit: () => window.location.replace(url),
  view: () => m('')
})

class MithrilUI {
  constructor () {
    m.route.prefix('', {})
    m.route(root, '/', {
      '/': withCookies({
        oninit: function (vnode) {
          const sourceManager = require('../../SourceManager').default
          m.route.set(`/${sourceManager.source}`, null, {
            replace: true
          })
        },
        view: function (vnode) {
          return m('')
        }
      }),
      // Pages added with the redesign, mapped to their closest classic equivalents
      '/home': withCookies(Settings),
      '/about': ExternalPage('https://github.com/nicolaschan/bell/blob/master/README.md'),
      '/contact': ExternalPage('https://blog.bell.plus/contact/'),
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
