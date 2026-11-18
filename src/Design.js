// Which UI to show: the redesign ('new') or the original bell.plus UI ('classic').
// The choice lives in localStorage so html/index.html can read it synchronously
// and load the matching stylesheet before anything renders.
const KEY = 'bell_design'

const Design = {
  get current () {
    return document.documentElement.getAttribute('data-design') === 'classic' ? 'classic' : 'new'
  },

  // Save the choice and reload into it
  switchTo (design) {
    try {
      window.localStorage.setItem(KEY, design)
    } catch (e) {
      // Storage blocked: the switch only lasts for this page load
      document.documentElement.setAttribute('data-design', design)
    }
    window.location.reload()
  }
}

module.exports = Design
