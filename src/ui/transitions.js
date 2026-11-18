const m = require('mithril')

const reducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Navigate to `path` with the new page sliding up over the old one ('up'), or
// the old page sliding down to reveal the new one ('down'). Uses the browser's
// View Transitions where available and navigates instantly otherwise.
const sheetTo = (path, direction) => {
  if (!document.startViewTransition || reducedMotion()) {
    m.route.set(path)
    return
  }
  const root = document.documentElement
  root.setAttribute('data-transition', direction === 'down' ? 'sheet-down' : 'sheet-up')
  const transition = document.startViewTransition(() => new Promise(resolve => {
    m.route.set(path)
    // The browser holds animation frames while it captures the new page, and
    // Mithril waits for a frame when it redrew less than 16ms ago. Waiting 20ms
    // on a timer makes the next redraw render immediately instead.
    setTimeout(() => {
      m.redraw()
      // Let the new page's images finish decoding (up to 200ms) so it slides
      // in complete instead of having illustrations pop in afterwards
      const images = Array.prototype.slice.call(document.querySelectorAll('img'))
        .filter(img => !img.complete && img.decode)
      Promise.race([
        Promise.all(images.map(img => img.decode().catch(() => {}))),
        new Promise(resolve => setTimeout(resolve, 200))
      ]).then(resolve)
    }, 20)
  }))
  transition.finished.then(() => root.removeAttribute('data-transition'), () => root.removeAttribute('data-transition'))
}

// Links into the personal schedule builder open it as a sheet from the bottom
const routePath = a => (a.getAttribute('href') || '').replace(/^#!/, '')
const installSheetLinks = () => {
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = e.target.closest && e.target.closest('a[href]')
    if (!a || routePath(a) !== '/classes' || m.route.get() === '/classes') return
    e.preventDefault()
    e.stopPropagation()
    sheetTo('/classes', 'up')
  }, true)
}

module.exports = { sheetTo, installSheetLinks }
