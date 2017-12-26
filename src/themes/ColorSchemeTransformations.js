// Translate simplified color strings to full color object
var fromObjectStrings = function (color) {
  var output = {}
  if (typeof color.background === 'string') {
    output.background = {
      'background-color': color.background
    }
  } else {
    output.background = color.background
  }
  if (typeof color.text === 'string') {
    output.text = {
      color: color.text
    }
  } else {
    output.text = color.text
  }
  if (typeof color.subtext === 'string') {
    output.subtext = {
      color: color.subtext
    }
  } else {
    output.subtext = color.subtext
  }
  if (typeof color.contrast === 'string') {
    output.contrast = {
      'background-color': color.contrast
    }
  } else {
    output.contrast = color.contrast
  }
  return output
}

var fromColorLight = function (color) {
  return fromObjectStrings({
    background: color,
    text: 'black',
    subtext: 'black',
    contrast: 'white'
  })
}

var fromColorDark = function (color) {
  return fromObjectStrings({
    background: 'black',
    text: color,
    subtext: 'white',
    contrast: '#444'
  })
}

module.exports = {
  fromObjectStrings: fromObjectStrings,
  fromColorLight: fromColorLight,
  fromColorDark: fromColorDark
}
