const m = require('mithril')
const root = document.body

const Index = require('./ui/Index')
const PeriodEntry = require('./ui/PeriodEntry')
const Classes = require('./ui/Classes')
const Landing = require('./ui/Landing')
const { About, Contact } = require('./ui/InfoPages')
const Loading = require('./ui/Loading').default

const withCookies = function (element) {
  return {
    oninit: function (vnode) {
      vnode.attrs.cookieManager = require('./LocalForageCookieManager').default
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
          vnode.attrs.cookieManager = require('./LocalForageCookieManager').default
          vnode.attrs.cookieManager.initialize()
        }
        return m(Loading, 'Loading')
      }
      return m(element, vnode.attrs)
    }
  }
}

// Send returning visitors straight to their timer; first-time visitors see the landing page
const Home = {
  view: function (vnode) {
    const cookieManager = vnode.attrs.cookieManager
    if (cookieManager.get('source')) {
      const sourceManager = require('./SourceManager').default
      m.route.set(`/${sourceManager.source}`, null, { replace: true })
      return m('')
    }
    return m(Landing)
  }
}

// Old bookmarks of /settings open the timer with the settings panel showing
const OpenSettings = {
  oninit: function () {
    const sourceManager = require('./SourceManager').default
    Index.openTimerWith('settings')
    m.route.set(`/${sourceManager.source}`, null, { replace: true })
  },
  view: function () {
    return m('')
  }
}

const Redirect = path => ({
  oninit: () => m.route.set(path, null, { replace: true }),
  view: () => m('')
})

class MithrilUI {
  constructor () {
    m.route.prefix('', {})
    m.route(root, '/', {
      '/': withCookies(Home),
      '/home': withCookies(Landing),
      '/about': withCookies(About),
      '/contact': withCookies(Contact),
      '/settings': withCookies(OpenSettings),
      '/periods': withCookies(PeriodEntry),
      '/classes': withCookies(Classes),
      '/enter': Redirect('/classes'),
      '/:source': withCookies(Index)
    })
  }

  redraw () {
    m.redraw()
  }
}

module.exports = MithrilUI
