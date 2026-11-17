// Seasonal overlays for the timer (e.g. falling snowflakes over the winter
// holidays). Each overlay is only available during its dates; while it is,
// Settings shows a switch so people can turn it off.
const cookieManager = require('./LocalForageCookieManager').default

const HIDDEN_KEY = 'seasonal_hidden'

// Month is 1-12. A range that crosses New Year (e.g. Dec 22 - Jan 1) wraps.
const inRange = (date, [startMonth, startDay], [endMonth, endDay]) => {
  const value = (date.getMonth() + 1) * 100 + date.getDate()
  const start = startMonth * 100 + startDay
  const end = endMonth * 100 + endDay
  return start <= end ? value >= start && value <= end : value >= start || value <= end
}

const OVERLAYS = [
  {
    id: 'snow',
    name: 'Snowflakes',
    description: 'Falling snowflakes from December 22 through New Year’s Day.',
    activeOn: date => inRange(date, [12, 22], [1, 1])
  },
  {
    id: 'heart',
    name: 'Valentine’s heart',
    description: 'A heart inside the timer on Valentine’s Day.',
    activeOn: date => inRange(date, [2, 14], [2, 14])
  }
]

const hidden = () => cookieManager.get(HIDDEN_KEY, {})

const Seasonal = {
  // Overlays whose dates include `date`, whether or not they are turned off
  available (date) {
    return OVERLAYS.filter(overlay => overlay.activeOn(date))
  },

  // Overlays to draw right now
  showing (date) {
    const off = hidden()
    return Seasonal.available(date).filter(overlay => !off[overlay.id])
  },

  isOn (id) {
    return !hidden()[id]
  },

  setOn (id, on) {
    const off = Object.assign({}, hidden())
    if (on) {
      delete off[id]
    } else {
      off[id] = true
    }
    cookieManager.set(HIDDEN_KEY, off).catch(() => {})
  }
}

module.exports = Seasonal
