module.exports = function (interval) {
  return function (colors) {
    return function (bellTimer) {
      var time = Math.floor(bellTimer.getTimeRemainingMs() / 1000)
      return colors[Math.floor(time / interval) % colors.length]
    }
  }
}
