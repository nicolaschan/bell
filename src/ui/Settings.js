const m = require('mithril')

const Appearance = require('../Appearance')
const notificationManager = require('../NotificationManager').default
const soundManager = require('../SoundManager').default
const { SOUND_OPTIONS } = require('../SoundManager')
const Icon = require('./Icon')
const { Dropdown, MenuSeparator, MenuButton } = require('./Dropdown')

const MAX_CUSTOM_SOUND_BYTES = 2 * 1024 * 1024
const DYNAMIC_THEMES_HELP = 'Dynamic themes fill the timer with a gradient, so its color shifts as the period counts down.'

const Toggle = {
  view (vnode) {
    const { checked, disabled, onchange, label } = vnode.attrs
    return m('button.toggle[type=button][role=switch]', {
      'aria-checked': checked ? 'true' : 'false',
      'aria-label': label,
      disabled,
      onclick: () => onchange(!checked)
    }, m('img', {
      src: `/img/redesign/toggle-${checked ? 'on' : 'off'}.svg`,
      width: 40,
      height: 24,
      alt: ''
    }))
  }
}

const ThemeSwatch = {
  view (vnode) {
    const { theme, selected } = vnode.attrs
    const attrs = {
      title: theme.name,
      'aria-label': theme.name,
      'aria-pressed': selected ? 'true' : 'false',
      className: selected ? 'selected' : '',
      onclick: () => Appearance.setTheme(theme.id)
    }
    if (theme.type === 'color') {
      return m('button.swatch.color-swatch[type=button]', Object.assign(attrs, {
        style: { background: theme.swatch }
      }))
    }
    return m('button.swatch.dynamic-swatch[type=button]', attrs,
      m('img', { src: theme.icon, alt: '', width: 62, height: 62 }))
  }
}

const pickCustomSound = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'audio/*'
  input.onchange = () => {
    const file = input.files && input.files[0]
    if (!file) {
      return
    }
    if (file.size > MAX_CUSTOM_SOUND_BYTES) {
      window.alert('Please choose a sound file smaller than 2 MB.')
      return
    }
    const reader = new window.FileReader()
    reader.onload = async () => {
      await soundManager.setCustomSound(file.name, reader.result)
      soundManager.reportInteraction()
      soundManager.preview('custom')
      m.redraw()
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

const SoundSelect = {
  view () {
    const selection = soundManager.getSelection()
    const customName = soundManager.getCustomSoundName()
    const options = SOUND_OPTIONS.concat(customName ? [{ id: 'custom', name: customName }] : [])
    const current = options.find(option => option.id === selection) || options[0]

    return m('.sound-select', [
      m('button.icon-button.plain[type=button]', {
        title: 'Preview sound',
        'aria-label': 'Preview sound',
        onclick: () => soundManager.preview(current.id)
      }, m(Icon, { name: 'volume' })),
      m(Dropdown, {
        align: 'right',
        trigger: ({ open, toggle }) => m('button.select-button[type=button]', {
          'aria-haspopup': 'menu',
          'aria-expanded': open ? 'true' : 'false',
          onclick: toggle
        }, [m('span.select-label', current.name), m(Icon, { name: 'chevron-down', size: 16 })]),
        menu: ({ close }) => {
          const items = []
          options.forEach(option => {
            items.push(m(MenuButton, {
              onclick: () => {
                soundManager.setSelection(option.id)
                soundManager.reportInteraction()
                soundManager.preview(option.id)
                close()
              }
            }, option.name))
            items.push(m(MenuSeparator))
          })
          items.push(m(MenuButton, {
            icon: 'upload',
            onclick: () => {
              close()
              pickCustomSound()
            }
          }, 'Upload your own'))
          return items
        }
      })
    ])
  }
}

const Settings = {
  oncreate (vnode) {
    vnode.state.onKeyDown = e => {
      if (e.key === 'Escape' && !vnode.dom.querySelector('.dropdown-menu')) {
        vnode.attrs.onclose()
        m.redraw()
      }
    }
    document.addEventListener('keydown', vnode.state.onKeyDown)
    const close = vnode.dom.querySelector('.close-button')
    if (close) {
      close.focus()
    }
  },
  onremove (vnode) {
    document.removeEventListener('keydown', vnode.state.onKeyDown)
  },
  view (vnode) {
    const { onclose, showCustomize } = vnode.attrs
    const theme = Appearance.theme
    const dark = Appearance.darkMode
    const blocked = notificationManager.notificationsBlocked()

    return m('.modal-backdrop', {
      onclick: e => {
        if (e.target === e.currentTarget) {
          onclose()
        }
      }
    }, m('.modal.settings[role=dialog][aria-modal=true][aria-labelledby=settings-title]', [
      m('.modal-title-row', [
        m('h2#settings-title.modal-title', 'Settings'),
        m('button.icon-button.plain.close-button[type=button]', {
          'aria-label': 'Close settings',
          onclick: onclose
        }, m(Icon, { name: 'x' }))
      ]),

      m('section.settings-section', [
        m('h3.section-title', 'Theme colors'),
        m('.swatch-grid', Appearance.colorThemes.map(t => m(ThemeSwatch, { theme: t, selected: t.id === theme.id })))
      ]),

      m('section.settings-section', [
        m('h3.section-title', [
          'Dynamic themes',
          m('span.info[tabindex=0]', {
            title: DYNAMIC_THEMES_HELP,
            'aria-label': DYNAMIC_THEMES_HELP
          }, m(Icon, { name: 'info', width: 17.5, height: 17.5 }))
        ]),
        m('.swatch-grid', Appearance.dynamicThemes.map(t => m(ThemeSwatch, { theme: t, selected: t.id === theme.id })))
      ]),

      m('section.settings-list', [
        m('.settings-row', [
          m('span.section-title', 'Light / dark mode'),
          m('button.mode-toggle[type=button]', {
            'aria-label': dark ? 'Switch to light mode' : 'Switch to dark mode',
            title: dark ? 'Dark mode' : 'Light mode',
            onclick: e => {
              Appearance.setDarkMode(!dark)
              // Restart the spin-in animation on the icon (removing the class and
              // forcing a reflow lets the same animation play again)
              const icon = e.currentTarget.querySelector('.mode-icon')
              icon.classList.remove('spin')
              void icon.offsetWidth
              icon.classList.add('spin')
            }
          }, m('span.mode-icon', {
            onanimationend: e => e.currentTarget.classList.remove('spin')
          }, m(Icon, { name: dark ? 'moon' : 'sun' })))
        ]),
        showCustomize ? m('.settings-row.customize-row', [
          m('.settings-row-text', [
            m('span.section-title', 'Customize block names'),
            m('span.caption', 'Rename your class blocks so your schedule matches your real day — like “Math,” “English,” or “PE.”')
          ]),
          m('a.button.outline[href=/periods]', { oncreate: m.route.link }, [
            m(Icon, { name: 'edit' }),
            m('span', 'Customize')
          ])
        ]) : null,
        m(MenuSeparator),
        m('.settings-row.toggle-row', [
          m('span.toggle-label', blocked
            ? 'Notifications are blocked. Allow them in your browser settings to get a notification when each period starts / ends.'
            : 'Send a push notification when each period starts / ends'),
          m(Toggle, {
            label: 'Send a push notification when each period starts / ends',
            checked: notificationManager.isEnabled(),
            disabled: blocked,
            onchange: async checked => {
              if (checked) {
                await notificationManager.enable()
              } else {
                notificationManager.disable()
              }
              m.redraw()
            }
          })
        ]),
        m('.settings-row.toggle-row', [
          m('span.toggle-label', 'Play a sound when each period starts / ends'),
          m(Toggle, {
            label: 'Play a sound when each period starts / ends',
            checked: soundManager.isEnabled(),
            onchange: checked => {
              soundManager.setEnabled(checked)
              soundManager.reportInteraction()
            }
          })
        ]),
        m('.settings-row', [
          m('span.toggle-label', 'Sound selection'),
          m(SoundSelect)
        ])
      ])
    ]))
  }
}

module.exports = Settings
