const m = require('mithril')

// Icons exported from the design. They are black, so dark mode inverts them in CSS.
const Icon = {
  view (vnode) {
    const { name, size = 20, width, height } = vnode.attrs
    return m('img.icon', {
      src: `/img/redesign/${name}.svg`,
      width: width || size,
      height: height || size,
      alt: ''
    })
  }
}

module.exports = Icon
