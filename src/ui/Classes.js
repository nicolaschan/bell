const m = require('mithril')
const shortid = require('shortid')

const Appearance = require('../Appearance')
const sourceManager = require('../SourceManager').default
const Icon = require('./Icon')
const { formatShortTime, pad } = require('./format')

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const WEEKDAYS = DAYS.slice(0, 5)
const EVERY_WEEKDAY = 'Weekdays'
const HOURS = Array.from({ length: 24 }, (_, h) => h)
const MINUTES = Array.from({ length: 60 }, (_, min) => min)

const hourLabel = h => `${h % 12 === 0 ? 12 : h % 12} ${h >= 12 ? 'PM' : 'AM'}`
const toMinutes = (h, min) => h * 60 + min

const emptyRow = () => ({ day: '', startH: '', startM: '', endH: '', endM: '' })

const rowComplete = row => row.day !== '' && row.startH !== '' && row.startM !== '' &&
  row.endH !== '' && row.endM !== ''

const rowOrderError = row => rowComplete(row) &&
  toMinutes(+row.endH, +row.endM) <= toMinutes(+row.startH, +row.startM)

const draftValid = draft => draft.name.trim() !== '' && draft.rows.length > 0 &&
  draft.rows.every(row => rowComplete(row) && !rowOrderError(row))

const courseToDraft = (id, course) => ({
  id,
  name: course.name || '',
  rows: (course.sections || []).map(([day, start, end]) => ({
    day,
    startH: start[0],
    startM: start[1],
    endH: end[0],
    endM: end[1]
  }))
})

const draftToCourse = draft => {
  const sections = []
  for (const row of draft.rows) {
    const days = row.day === EVERY_WEEKDAY ? WEEKDAYS : [row.day]
    for (const day of days) {
      sections.push([day, [+row.startH, +row.startM], [+row.endH, +row.endM]])
    }
  }
  return { name: draft.name.trim(), sections }
}

// "Monday, Wednesday at 10AM – 11AM" lines, grouping days that share a time
const describeSections = sections => {
  const groups = []
  for (const [day, start, end] of sections) {
    const range = `${formatShortTime(start[0], start[1])} – ${formatShortTime(end[0], end[1])}`
    let group = groups.find(g => g.range === range)
    if (!group) {
      group = { range, days: [] }
      groups.push(group)
    }
    group.days.push(day)
  }
  return groups.map(g => {
    const days = g.days.slice().sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b))
    return `${days.join(', ')} at ${g.range}`
  })
}

const Select = {
  view (vnode) {
    const { value, placeholder, options, onchange, label, className = '' } = vnode.attrs
    return m('.select-wrap', { className: `${className} ${value === '' ? 'is-placeholder' : ''}` }, [
      m('select', {
        'aria-label': label,
        value: String(value),
        onchange: e => onchange(e.target.value)
      }, [
        m('option[value=""][disabled]', placeholder),
        options.map(([optionValue, text]) => m('option', { value: String(optionValue) }, text))
      ]),
      m(Icon, { name: 'chevron-down', size: 16 })
    ])
  }
}

const TimePicker = {
  view (vnode) {
    const { hour, minute, onhour, onminute, label } = vnode.attrs
    return m('.time-picker', [
      m(Select, {
        className: 'bare',
        label: `${label} hour`,
        value: hour,
        placeholder: 'Hour',
        options: HOURS.map(h => [h, hourLabel(h)]),
        onchange: v => onhour(+v)
      }),
      m(Select, {
        className: 'bare',
        label: `${label} minute`,
        value: minute,
        placeholder: 'Minute',
        options: MINUTES.map(min => [min, pad(min)]),
        onchange: v => onminute(+v)
      })
    ])
  }
}

const TimeRow = {
  view (vnode) {
    const { row, index, canRemove, onremove } = vnode.attrs
    const set = key => value => { row[key] = value }
    return m('.time-row', [
      m('.time-row-fields', [
        m('.field.day-field', [
          m('span.field-label', 'Day'),
          m(Select, {
            label: 'Day',
            value: row.day,
            placeholder: 'Select a day',
            options: DAYS.map(day => [day, day]).concat([[EVERY_WEEKDAY, 'Every weekday']]),
            onchange: set('day')
          })
        ]),
        m('.field', [
          m('span.field-label', 'Start time'),
          m(TimePicker, { label: 'Start', hour: row.startH, minute: row.startM, onhour: set('startH'), onminute: set('startM') })
        ]),
        m('.field', [
          m('span.field-label', 'End time'),
          m(TimePicker, { label: 'End', hour: row.endH, minute: row.endM, onhour: set('endH'), onminute: set('endM') })
        ]),
        m('button.icon-button.plain.remove-row[type=button]', {
          'aria-label': `Remove time ${index + 1}`,
          title: 'Remove this time',
          disabled: !canRemove,
          onclick: onremove
        }, m(Icon, { name: 'trash' }))
      ]),
      rowOrderError(row) ? m('p.field-error', 'End time must be after start time.') : null
    ])
  }
}

const EditCard = {
  oncreate (vnode) {
    const input = vnode.dom.querySelector('input')
    if (input && !vnode.attrs.draft.name) input.focus()
  },
  view (vnode) {
    const { draft, isNew, onsave, ondelete } = vnode.attrs
    const valid = draftValid(draft)
    return m('form.card.class-card.editing', {
      onsubmit: e => {
        e.preventDefault()
        if (valid) onsave()
      }
    }, [
      m('label.card-question', [
        m('span', 'What is the name of this block?'),
        m('input.text-input[type=text][maxlength=40][placeholder=e.g. Chemistry]', {
          value: draft.name,
          oninput: e => { draft.name = e.target.value }
        })
      ]),
      m('p.card-question', 'When does this block happen?'),
      draft.rows.map((row, i) => m(TimeRow, {
        key: i,
        row,
        index: i,
        canRemove: draft.rows.length > 1,
        onremove: () => draft.rows.splice(i, 1)
      })),
      m('button.text-button[type=button]', {
        onclick: () => draft.rows.push(emptyRow())
      }, [m(Icon, { name: 'plus' }), 'Add another time']),
      m('.card-actions', [
        m('button.button.secondary[type=button]', { onclick: ondelete }, 'Delete'),
        m('button.button.primary[type=submit]', { disabled: !valid }, isNew ? 'Add block' : 'Save block')
      ])
    ])
  }
}

const SavedCard = {
  view (vnode) {
    const { course, onedit } = vnode.attrs
    return m('.card.class-card.saved', [
      m('.saved-text', [
        m('h2.saved-name', course.name),
        describeSections(course.sections || []).map(line => m('p.saved-times', line))
      ]),
      m('button.button.secondary[type=button]', { onclick: onedit }, [m(Icon, { name: 'edit' }), 'Edit'])
    ])
  }
}

const Classes = {
  oninit (vnode) {
    sourceManager.source = 'custom'
    vnode.state.draft = null
  },
  view (vnode) {
    Appearance.apply()
    document.title = 'Build your schedule'
    const cookieManager = vnode.attrs.cookieManager
    const courses = cookieManager.get('courses', {})
    const ids = Object.keys(courses)
    const state = vnode.state

    const startNew = () => {
      state.draft = { id: null, name: '', rows: [emptyRow()] }
    }
    const save = () => {
      const all = cookieManager.get('courses', {})
      all[state.draft.id || shortid.generate()] = draftToCourse(state.draft)
      cookieManager.set('courses', all)
      state.draft = null
    }
    const remove = () => {
      if (state.draft.id) {
        const all = cookieManager.get('courses', {})
        delete all[state.draft.id]
        // Bug fixed in >= 3.2.11, we were accidentially setting 'classes' cookie
        cookieManager.remove('classes')
        cookieManager.set('courses', all)
      }
      state.draft = null
    }
    const editCard = isNew => m(EditCard, { key: 'edit', draft: state.draft, isNew, onsave: save, ondelete: remove })

    const cards = []
    if (state.draft && !state.draft.id) cards.push(editCard(true))
    for (const id of ids) {
      if (state.draft && state.draft.id === id) {
        cards.push(editCard(false))
      } else {
        cards.push(m(SavedCard, {
          key: id,
          course: courses[id],
          onedit: () => { state.draft = courseToDraft(id, courses[id]) }
        }))
      }
    }

    return m('.builder-page', [
      m('header.page-header.builder-header', [
        m('.builder-heading', [
          m('h1.header-title', 'Build your schedule'),
          m('p.header-subtitle', 'Add everything that’s part of your school day — like classes, lunch, or free time.')
        ]),
        ids.length || state.draft ? m('button.button.secondary[type=button]', {
          disabled: !!(state.draft && !state.draft.id),
          onclick: startNew
        }, [m(Icon, { name: 'plus' }), 'Add a block']) : null,
        m('a.icon-button.plain.close-button[href=/custom]', {
          'aria-label': 'Done, back to timer',
          title: 'Back to timer',
          oncreate: m.route.link
        }, m(Icon, { name: 'close', size: 28 }))
      ]),
      m('main.builder-content', cards.length ? cards : m('.empty-state', [
        m('p.empty-title', 'You haven’t added any blocks yet.'),
        m('img', {
          src: `/img/redesign/${Appearance.darkMode ? 'no-blocks-dark' : 'no-blocks'}.svg`,
          width: 208.605,
          height: 196.771,
          alt: ''
        }),
        m('button.button.secondary[type=button]', { onclick: startNew }, [m(Icon, { name: 'plus' }), 'Add a block'])
      ]))
    ])
  }
}

module.exports = Classes
