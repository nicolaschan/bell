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

// Lunar New Year falls on a different day each year (month, day)
const LUNAR_NEW_YEAR = {
  2025: [1, 29],
  2026: [2, 17],
  2027: [2, 6],
  2028: [1, 26],
  2029: [2, 13],
  2030: [2, 3],
  2031: [1, 23],
  2032: [2, 11],
  2033: [1, 31],
  2034: [2, 19],
  2035: [2, 8],
  2036: [1, 28],
  2037: [2, 15],
  2038: [2, 4],
  2039: [1, 24],
  2040: [2, 12]
}

const isLunarNewYear = date => {
  const day = LUNAR_NEW_YEAR[date.getFullYear()]
  return !!day && inRange(date, day, day)
}

const OVERLAYS = [
  {
    id: 'snow',
    name: 'Snowflakes',
    activeOn: date => inRange(date, [12, 1], [12, 31])
  },
  {
    id: 'lights',
    name: 'Christmas lights',
    activeOn: date => inRange(date, [12, 25], [12, 25])
  },
  {
    id: 'fireworks',
    name: 'Fireworks',
    activeOn: date => inRange(date, [1, 1], [1, 1])
  },
  {
    id: 'lunar',
    name: 'Lunar New Year theme',
    activeOn: isLunarNewYear
  },
  {
    id: 'heart',
    name: 'Valentine’s heart',
    activeOn: date => inRange(date, [2, 14], [2, 14])
  },
  {
    id: 'earth',
    name: 'Spinning Earth',
    activeOn: date => inRange(date, [4, 22], [4, 22])
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

  // Whether the overlay `id` is showing on `date`
  has (date, id) {
    return Seasonal.showing(date).some(overlay => overlay.id === id)
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
