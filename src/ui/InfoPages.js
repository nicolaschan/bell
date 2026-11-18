const m = require('mithril')
const Appearance = require('../Appearance')
const SiteHeader = require('./SiteHeader')

const InfoPage = {
  view (vnode) {
    Appearance.apply()
    return m('.info-page', [
      m(SiteHeader),
      m('main.info-content', [
        m('h1.display-title', vnode.attrs.title),
        m('.info-body', [
          m('.rule'),
          m('.info-columns', vnode.children)
        ])
      ])
    ])
  }
}

const About = {
  view () {
    document.title = 'About bell.plus'
    return m(InfoPage, { title: 'About bell.plus' }, [
      m('.info-column', [
        m('p', 'Bell is a live, synchronized timer that counts down to the next bell, so you always know when class starts, when it ends, and how much time is left in between periods.'),
        m('p', 'Whether you’re a student, teacher, or staff member, bell makes it easy to stay in sync with your school’s schedule.')
      ]),
      m('.info-column', [
        m('p', 'This software was developed by Los Altos High School alumni, nicolaschan and noloerino.'),
        m('p', 'It was redesigned by Elizabeth Wang and continues to be maintained by Nicolas Chan.'),
        m('p', ['Usage statistics are available at ', m('a[href=/stats]', 'bell.plus/stats'), '.'])
      ])
    ])
  }
}

const CONTACT_EMAIL = 'hello@bell.plus'

const Contact = {
  view () {
    document.title = 'Contact us'
    return m(InfoPage, { title: 'Contact us' }, [
      m('.info-column', [
        m('p.strong', 'For general inquiries and feedback'),
        m('p', m(`a[href=mailto:${CONTACT_EMAIL}]`, CONTACT_EMAIL))
      ])
    ])
  }
}

module.exports = { About, Contact }
