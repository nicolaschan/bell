const m = require('mithril')

// Header shared by the landing, About and Contact pages
const SiteHeader = {
  view () {
    return m('header.page-header.site-header', [
      m('a.wordmark[href=/home]', { oncreate: m.route.link, 'aria-label': 'bell home' },
        m('img.icon', { src: '/img/redesign/bell-wordmark.svg', width: 80.679, height: 23.922, alt: 'bell' })),
      m('nav.site-links', [
        m('a[href=/about]', { oncreate: m.route.link }, 'About bell.plus →'),
        m('a[href=/contact]', { oncreate: m.route.link }, 'Contact us →')
      ])
    ])
  }
}

module.exports = SiteHeader
