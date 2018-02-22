const m = require('mithril')
const root = document.body

const Index = require('./ui/Index')
const Settings = require('./ui/Settings')
const PeriodEntry = require('./ui/PeriodEntry')
const Classes = require('./ui/Classes')

const addUIModel = function (element, uiModel) {
  return {
    view: function (vnode) {
      if (!uiModel.state.ready) {
        if (!uiModel.state.errorMessage.visible) {
          return m('.centered.loading', [
            m('i.material-icons.loading-icon.spin', 'sync'),
            m('br'),
            m('.loading-message', uiModel.state.loadingMessage.value)
          ])
        }
        return m('.centered.loading', [
          m('i.material-icons.loading-icon', 'error_outline'),
          m('br'),
          m('.loading-message', uiModel.state.errorMessage.value)
        ])
      }
      return m(element, { uiModel })
    }
  }
}

class MithrilUI {
  constructor (uiModel) {
    this.uiModel = uiModel

    m.route.prefix('#!')
    m.route(root, '/', {
      '/': addUIModel(Index, uiModel),
      '/settings': addUIModel(Settings, uiModel),
      '/periods': addUIModel(PeriodEntry, uiModel),
      '/classes': addUIModel(Classes, uiModel)
    })
  }

  redraw () {
    m.redraw()
  }
}

module.exports = MithrilUI
