const m = require('mithril')
const shortid = require('shortid')

const TodoList = {
  oninit: function (vnode) {
    vnode.state.newTaskText = ''
    vnode.state.selectedPeriod = ''
    // Filter out completed tasks on init (for backwards compatibility)
    const allTodos = vnode.attrs.cookieManager.get('todos', [])
    vnode.state.todos = allTodos.filter(t => t.completed !== true)
    // Save the filtered list back if any were removed
    if (allTodos.length !== vnode.state.todos.length) {
      vnode.attrs.cookieManager.set('todos', vnode.state.todos)
    }
  },

  getAvailablePeriods: function (bellTimer) {
    const periods = []
    const completed = bellTimer.getCompletedPeriods()
    const current = bellTimer.getCurrentPeriod()
    const future = bellTimer.getFuturePeriods()

    // Add all periods, excluding Free and any period with "Passing" in the name
    completed.forEach(p => {
      if (p.name !== 'Free' && 
          !p.name.includes('Passing') && 
          !periods.find(ep => ep.name === p.name)) {
        periods.push(p)
      }
    })
    if (current && 
        current.name !== 'Free' && 
        !current.name.includes('Passing') && 
        !periods.find(ep => ep.name === current.name)) {
      periods.push(current)
    }
    future.forEach(p => {
      if (p.name !== 'Free' && 
          !p.name.includes('Passing') && 
          !periods.find(ep => ep.name === p.name)) {
        periods.push(p)
      }
    })

    // Sort by time
    periods.sort((a, b) => {
      const timeA = a.time.hour * 60 + a.time.min
      const timeB = b.time.hour * 60 + b.time.min
      return timeA - timeB
    })

    return periods
  },

  addTodo: async function (vnode) {
    const text = vnode.state.newTaskText.trim()
    if (!text) return

    const newTodo = {
      id: shortid.generate(),
      text: text,
      period: vnode.state.selectedPeriod || null,
      createdAt: Date.now()
    }

    vnode.state.todos.push(newTodo)
    vnode.state.newTaskText = ''
    vnode.state.selectedPeriod = ''
    await vnode.attrs.cookieManager.set('todos', vnode.state.todos)
    m.redraw()
  },

  toggleTodo: async function (vnode, todoId) {
    // When a todo is checked, delete it instead of marking as completed
    vnode.state.todos = vnode.state.todos.filter(t => t.id !== todoId)
    await vnode.attrs.cookieManager.set('todos', vnode.state.todos)
    m.redraw()
  },

  deleteTodo: async function (vnode, todoId) {
    vnode.state.todos = vnode.state.todos.filter(t => t.id !== todoId)
    await vnode.attrs.cookieManager.set('todos', vnode.state.todos)
    m.redraw()
  },

  getTodosForPeriod: function (todos, periodName) {
    if (!periodName) {
      return todos.filter(t => !t.period)
    }
    return todos.filter(t => t.period === periodName)
  },

  view: function (vnode) {
    const bellTimer = vnode.attrs.bellTimer
    const cookieManager = vnode.attrs.cookieManager
    const todos = vnode.state.todos || []
    const availablePeriods = this.getAvailablePeriods(bellTimer)
    const currentPeriod = bellTimer.getCurrentPeriod()

    // Group todos by period (only show incomplete todos)
    const todosByPeriod = {}
    const unassignedTodos = []

    todos.forEach(todo => {
      if (todo.period) {
        if (!todosByPeriod[todo.period]) {
          todosByPeriod[todo.period] = []
        }
        todosByPeriod[todo.period].push(todo)
      } else {
        unassignedTodos.push(todo)
      }
    })

    return m('.todo-list-container', [
      m('.todo-list-header', [
        m('h2.todo-list-title', [
          m('i.material-icons', { style: { 'vertical-align': 'middle', 'margin-right': '8px' } }, 'check_circle'),
          'To-Do List'
        ])
      ]),

      // Add new todo form
      m('.todo-add-form', [
        m('.todo-form-inputs', [
          m('input.todo-input[type=text][placeholder=Add a task...]', {
            value: vnode.state.newTaskText,
            oninput: m.withAttr('value', function (value) {
              vnode.state.newTaskText = value
            }),
            onkeypress: function (e) {
              if (e.key === 'Enter') {
                TodoList.addTodo(vnode)
              }
            }
          }),
          m('select.todo-period-select', {
            value: vnode.state.selectedPeriod,
            onchange: m.withAttr('value', function (value) {
              vnode.state.selectedPeriod = value
            })
          }, [
            m('option[value=]', 'General'),
            ...availablePeriods.map(p => m('option[value=' + p.name + ']', p.name))
          ])
        ]),
        m('button.todo-add-button', {
          onclick: function () {
            TodoList.addTodo(vnode)
          }
        }, [
          m('i.material-icons', 'add')
        ])
      ]),

      // Display todos
      m('.todo-list-content', [
        // Unassigned todos
        unassignedTodos.length > 0 && m('.todo-group', [
          m('.todo-group-header', [
            m('i.material-icons', 'list'),
            m('span', 'General')
          ]),
          m('.todo-items', unassignedTodos.map(todo => m('.todo-item', [
            m('button.todo-complete', {
              onclick: function () {
                TodoList.toggleTodo(vnode, todo.id)
              }
            }, m('i.material-icons', 'check_circle')),
            m('span.todo-text', todo.text)
          ])))
        ]),

        // Todos by period
        Object.keys(todosByPeriod).sort().map(periodName => {
          const isCurrentPeriod = currentPeriod && currentPeriod.name === periodName
          return m('.todo-group', {
            class: isCurrentPeriod ? 'current-period' : ''
          }, [
            m('.todo-group-header', [
              m('i.material-icons', isCurrentPeriod ? 'schedule' : 'class'),
              m('span', periodName),
              isCurrentPeriod && m('span.todo-current-badge', 'Current')
            ]),
            m('.todo-items', todosByPeriod[periodName].map(todo => m('.todo-item', [
              m('button.todo-complete', {
                onclick: function () {
                  TodoList.toggleTodo(vnode, todo.id)
                }
              }, m('i.material-icons', 'check_circle')),
              m('span.todo-text', todo.text)
            ])))
          ])
        }),

        // Empty state
        todos.length === 0 && m('.todo-empty', [

          m('p', 'Looks like you\'re all caught up! 🌴'),
        ])
      ])
    ])
  }
}

module.exports = TodoList
