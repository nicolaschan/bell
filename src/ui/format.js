const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December']

const pad = n => (n < 10 ? '0' : '') + n

// 13, 5 -> "1:05 PM"
const formatTime = (hour, min) => {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}:${pad(min)} ${suffix}`
}

// 13, 0 -> "1PM", 13, 30 -> "1:30PM"
const formatShortTime = (hour, min) => {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return min ? `${h}:${pad(min)}${suffix}` : `${h}${suffix}`
}

// "September 22, 2025 | 11:11 AM"
const formatDateTime = date =>
  `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} | ` +
  formatTime(date.getHours(), date.getMinutes())

module.exports = { pad, formatTime, formatShortTime, formatDateTime }
