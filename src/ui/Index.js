const m = require('mithril')
const $ = require('jquery')

const ScheduleDisplay = require('./ScheduleDisplay')
const Page1 = require('./Page1')
const Popup = require('./Popup')
const SchoolIndicator = require('./SchoolIndicator')

const Index = {
  view: function (vnode) {
    var uiModel = vnode.attrs.uiModel

    return [m('span', {
      style: {
        'font-size': (Math.min(window.innerHeight * 0.3, window.innerWidth * 0.2) * 0.1) + 'px'
      }
    }, [m(Page1, {
      model: uiModel
    }), m('.container#page2', [
      m('.centered', [
        m(ScheduleDisplay, {
          model: uiModel
        })
      ]),
      m('.footer-left', [
        m('a[href=https://github.com/nicolaschan/bell/blob/master/README.md]', 'About'),
        m('a[href=https://github.com/nicolaschan/bell/blob/master/privacy.md][style=margin-left:1em;]', 'Privacy')]),
      m('.footer-right', m('a[href=/settings]', {
        oncreate: m.route.link
      }, m('i.settings-icon.icon.material-icons', 'settings')))
    ]), m(Popup, {
      model: uiModel
    }), m(SchoolIndicator, {
      model: uiModel
    }), m('i.down-arrow.pulse.material-icons', {
      onclick: function () {
        $('body, html').animate({
          scrollTop: $('#page2').offset().top
        }, 1500)
      },
      oninit: function () {
        if (uiModel.cookieManager.get('has_scrolled')) { return }
        $(window).on('scroll', function (e) {
          if ($(window).scrollTop() > 250) {
            $(window).off('scroll')
            uiModel.cookieManager.set('has_scrolled', true)
          }
        })
      },
      style: {
        visibility: uiModel.cookieManager.get('has_scrolled') ? 'hidden' : 'visible'
      }
    }, 'keyboard_arrow_down')])]
  }
}

module.exports = Index
