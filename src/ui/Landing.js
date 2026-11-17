const m = require('mithril')
const Appearance = require('../Appearance')
const requestManager = require('../RequestManager2').default
const SiteHeader = require('./SiteHeader')
const Icon = require('./Icon')
const { MenuSeparator } = require('./Dropdown')

const EDITOR_URL = 'https://edit.bell.plus'
const MAX_RESULTS = 8
// The "Don't see your schedule?" prompt is shown after this many results
const PROMPT_AFTER = 3

let sourcesPromise = null
const loadSources = () => {
  if (!sourcesPromise) {
    sourcesPromise = requestManager.get('/api/sources')
      .then(sources => sources
        .filter(source => source.id !== 'custom')
        .sort((a, b) => a.name.localeCompare(b.name)))
      .catch(e => {
        sourcesPromise = null
        throw e
      })
  }
  return sourcesPromise
}

const search = (sources, query) => {
  const q = query.trim().toLowerCase()
  if (!q) {
    return sources.slice(0, MAX_RESULTS)
  }
  const scored = []
  for (const source of sources) {
    const name = source.name.toLowerCase()
    const id = source.id.toLowerCase()
    let score = -1
    if (id === q) score = 0
    else if (name.startsWith(q) || id.startsWith(q)) score = 1
    else if (name.split(/\s+/).some(word => word.startsWith(q))) score = 2
    else if (name.includes(q) || id.includes(q)) score = 3
    if (score >= 0) scored.push({ source, score })
  }
  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, MAX_RESULTS)
    .map(entry => entry.source)
}

const NoSchedulePrompt = {
  view () {
    return m('.menu-prompt', [
      m('.menu-prompt-title', 'Don’t see your schedule?'),
      m('.menu-prompt-actions', [
        m(`a.button.outline[href=${EDITOR_URL}]`, 'Create school schedule'),
        m('a.button.outline[href=/classes]', { oncreate: m.route.link }, 'Use a personal schedule')
      ])
    ])
  }
}

const SchoolSearch = {
  oninit (vnode) {
    vnode.state.query = ''
    vnode.state.open = false
    vnode.state.active = -1
    vnode.state.sources = []
    loadSources().then(sources => {
      vnode.state.sources = sources
      m.redraw()
    }).catch(() => {
      vnode.state.error = true
      m.redraw()
    })
    vnode.state.onDocumentClick = e => {
      if (vnode.state.dom && !vnode.state.dom.contains(e.target) && vnode.state.open) {
        vnode.state.open = false
        m.redraw()
      }
    }
    document.addEventListener('mousedown', vnode.state.onDocumentClick)
  },
  oncreate (vnode) {
    vnode.state.dom = vnode.dom
  },
  onremove (vnode) {
    document.removeEventListener('mousedown', vnode.state.onDocumentClick)
  },
  view (vnode) {
    const state = vnode.state
    const results = search(state.sources, state.query)
    const choose = source => m.route.set(`/${source.id}`)

    const onkeydown = e => {
      if (e.key === 'ArrowDown') {
        state.open = true
        state.active = Math.min(results.length - 1, state.active + 1)
        e.preventDefault()
      } else if (e.key === 'ArrowUp') {
        state.active = Math.max(-1, state.active - 1)
        e.preventDefault()
      } else if (e.key === 'Enter') {
        const pick = results[state.active] || (state.query.trim() ? results[0] : null)
        if (pick) choose(pick)
      } else if (e.key === 'Escape') {
        state.open = false
      }
    }

    const items = []
    results.forEach((source, i) => {
      if (i > 0) items.push(m(MenuSeparator))
      if (i === PROMPT_AFTER) {
        items.push(m(NoSchedulePrompt), m(MenuSeparator))
      }
      items.push(m('a.search-result[role=option]', {
        id: `school-option-${i}`,
        href: `/${source.id}`,
        className: i === state.active ? 'active' : '',
        'aria-selected': i === state.active ? 'true' : 'false',
        onmousedown: e => e.preventDefault(),
        onclick: e => {
          e.preventDefault()
          choose(source)
        }
      }, m('span.result-name', `${source.name} (${source.id})`)))
    })
    if (results.length > 0 && results.length <= PROMPT_AFTER) {
      items.push(m(MenuSeparator), m(NoSchedulePrompt))
    }
    if (results.length === 0) {
      items.push(m('.search-message', state.error
        ? 'Couldn’t load schools. Check your connection and try again.'
        : (state.sources.length ? 'No schools match your search.' : 'Loading schools…')))
      if (state.sources.length) items.push(m(MenuSeparator), m(NoSchedulePrompt))
    }

    return m('.school-search', [
      m('label.search-field', [
        m(Icon, { name: 'search', size: 24 }),
        m('input[type=search][role=combobox][aria-autocomplete=list][aria-controls=school-results][autocomplete=off]', {
          placeholder: 'Search for your school schedule',
          'aria-label': 'Search for your school schedule',
          'aria-expanded': state.open ? 'true' : 'false',
          'aria-activedescendant': state.active >= 0 ? `school-option-${state.active}` : undefined,
          value: state.query,
          oncreate: v => { if (vnode.attrs.autofocus) v.dom.focus() },
          onfocus: () => { state.open = true },
          oninput: e => {
            state.query = e.target.value
            state.open = true
            state.active = -1
          },
          onkeydown
        })
      ]),
      state.open ? m('.menu.search-results#school-results[role=listbox]', {
        // Fit the list to the space left below the search box, so it scrolls
        // instead of running off the bottom of the (non-scrolling) page
        style: state.dom
          ? { 'max-height': `${Math.max(160, window.innerHeight - state.dom.getBoundingClientRect().bottom - 24)}px` }
          : {}
      }, items) : null
    ])
  }
}

// Screenshot of the app over a landscape. Its "View schedule" button switches the
// screenshot to the schedule page, and that page's close button switches it back.
const Preview = {
  oninit (vnode) {
    vnode.state.showSchedule = false
  },
  // Load the schedule screenshot ahead of time so switching is instant
  oncreate () {
    const img = new window.Image()
    img.src = '/img/redesign/landing-preview-schedule.webp'
  },
  view (vnode) {
    const state = vnode.state
    const showSchedule = state.showSchedule
    return m('section.landing-preview', { 'aria-label': 'Preview of bell' }, m('.preview-frame', m('.preview-switch', [
      m('img.preview-background', { src: '/img/redesign/landing-background.webp', width: 1344, height: 768, alt: '' }),
      m('.preview-app', { className: showSchedule ? 'schedule' : 'timer' }, m('img', {
        src: `/img/redesign/${showSchedule ? 'landing-preview-schedule' : 'landing-preview'}.webp`,
        width: 1838,
        height: 752,
        alt: showSchedule
          ? 'The schedule page, listing today’s classes with the current one in bold'
          : 'The timer page, counting down 27:16:00 until Lunch & Advisory ends'
      })),
      m('p.preview-caption', 'Easily switch between timer / schedule'),
      m('img.preview-arrow', { src: '/img/redesign/arrow-down.svg', width: 9.833, height: 21, alt: '' }),
      m('button.preview-hotspot[type=button]', {
        className: showSchedule ? 'close-hotspot' : 'schedule-hotspot',
        'aria-label': showSchedule ? 'Show the timer in the preview' : 'Show the schedule in the preview',
        onclick: () => { state.showSchedule = !showSchedule }
      })
    ])))
  }
}

const Landing = {
  view () {
    Appearance.apply()
    document.title = 'bell + your school'
    return m('.landing-page', [
      m(SiteHeader),
      m('main.landing-hero', [
        m('.landing-intro', [
          m('h1.display-title', [m('span.strong', 'bell '), '+ your school']),
          m('p.landing-subtitle', 'Easily see how much time is left in class.')
        ]),
        m(SchoolSearch, { autofocus: false }),
        m('.landing-alternatives', [
          m('span', 'Don’t see your schedule?'),
          m('.landing-alternative-buttons', [
            m(`a.button.secondary[href=${EDITOR_URL}]`, 'Create school schedule'),
            m('a.button.secondary[href=/classes]', { oncreate: m.route.link }, 'Use a personal schedule')
          ])
        ])
      ]),
      m(Preview)
    ])
  }
}

module.exports = Landing
