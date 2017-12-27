module.exports = function (colors, special = {}) {
  return function (bellTimer) {
    for (var schedule in special) {
      if (bellTimer.getCurrentSchedule().name === schedule) {
        return special[schedule]
      }
    }
    var minute = bellTimer.getTimeRemainingMs() / 1000 / 60
    if (minute <= 2) { return colors[0] }
    if (minute <= 5) { return colors[1] }
    if (minute <= 15) { return colors[2] }
    return colors[3]
  }
}
