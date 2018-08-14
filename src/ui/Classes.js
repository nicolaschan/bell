const m = require('mithril')

var displayTimeArray = function (time) {
  var [hour, min] = time
  var part = (hour >= 12) ? 'pm' : 'am'

  hour = (hour > 12) ? hour - 12 : hour
  min = min ? ':' + padNumber(min, 2) : ''

  return hour + min + part
}

var padNumber = function (number, padding) {
  var string = number.toString()
  while (string.length < padding) { string = '0' + string }
  return string
}

var deleteClass = function (id, cookieManager) {
  var courses = cookieManager.get('courses', {})
  delete courses[id]

  // Bug fixed in >= 3.2.11, we were accidentially setting 'classes' cookie
  cookieManager.remove('classes')

  cookieManager.set('courses', courses)
}

const Classes = {
  view: function (vnode) {
    return [
      m('.header', m('h1', 'Enter Classes')),
      m('.add-link', m('a.add[href=/enter]', {
        oncreate: m.route.link
      }, '+ Add Class')),
      m('ul.class-list#class-list', Object.keys(
        vnode.attrs.cookieManager.get('courses', {})).map(id => m('li', [
        m('a.course-link', {
          href: `/enter?course=${id}`,
          oncreate: m.route.link
        }, vnode.attrs.cookieManager.get('courses', {})[id].name),
        m('table.sections', m('tbody', [
          ...vnode.attrs.cookieManager.get('courses', {})[id].sections.map(section => m('tr', [
            m('td.day', section[0]),
            m('td', `${displayTimeArray(section[1])} - ${displayTimeArray(section[2])}`)
          ])),
          m('tr', [
            m('a.delete-link[href=javascript:void(0);]', {
              onclick: () => deleteClass(id, vnode.attrs.cookieManager)
            }, 'Delete')
          ])
        ]))
      ]))),
      m('.footer-right[style=position: fixed;]', m('a[href=/settings]', {
        oncreate: m.route.link
      }, m('i.done-icon.icon.material-icons', 'done')))
    ]
  }
}

module.exports = Classes
