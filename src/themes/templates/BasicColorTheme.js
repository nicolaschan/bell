module.exports = function (transformation, timing, colors, special = {}) {
  var newSpecial = {}
  for (var schedule in special) {
    newSpecial[schedule] = transformation(special[schedule])
  }
  return timing(colors.map(transformation), newSpecial)
}
