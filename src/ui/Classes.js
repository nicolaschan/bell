const m = require('mithril')
const $ = require('jquery')

const ScheduleDisplay = require('./ScheduleDisplay')
const Page1 = require('./Page1')
const Popup = require('./Popup')
const SchoolIndicator = require('./SchoolIndicator')

const Index = {
  view: function (vnode) {
    return [
      m('.header', m('h1', 'Enter Classes')),
      m('div[style=margin:1em auto;width:24em;]', [
        m('.add-link', (vnode.state.editClasses) ? m('a.add#edit-classes-button[href=/enter]', {
          oncreate: m.route.link
        }, '+ Add Class')),
        m('.footer-right[style=position: fixed;]', m('a[href=/]', {
          oncreate: m.route.link
        }, m('i.done-icon.icon.material-icons', 'done')))
      ])
    ]
  }
}

module.exports = Index
