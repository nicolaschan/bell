(function () {
  var Logger = function (level) {
    this.level = (level) || 0
  }

  Logger.prototype.log = function (message, prefix, color) {
    console.log('%c' + getTimestamp() + ' %c' + prefix + '%c: %c' + message, 'color:gray;', 'color:' + color + ';font-weight:600;', 'color:#aaaaaa;', 'color:black;')
  }

  var getTimestamp = function () {
    return new Date().toTimeString().substring(0, 8)
  }
  var toFunction = function (name, color) {
    return function (message) {
      Logger.prototype.log(message, name, color)
    }
  }

  var levels = [{
    level: -2,
    name: 'trace',
    func: toFunction('TRACE', 'cyan')
  }, {
    level: -1,
    name: 'debug',
    func: toFunction('DEBUG', 'gray')
  }, {
    level: 0,
    name: 'success',
    func: toFunction('SUCCESS', 'green')
  }, {
    level: 0,
    name: 'info',
    func: toFunction('INFO', 'blue')
  }, {
    level: 1,
    name: 'warn',
    func: console.warn
  }, {
    level: 2,
    name: 'error',
    func: console.error
  }]

  levels.reduce(function (acc, level) {
    Logger.prototype[level.name] = function (message) {
      if (level.level >= this.level) { level.func(message) }
    }
  })

  Logger.prototype.setLevel = function (level) {
    level = level.toLowerCase()
    if (level === 'all') { return (this.level = -1000) }
    if (level === 'none') { return (this.level = 1000) }
    for (var i in levels) {
      if (levels[i].name === level) { return (this.level = levels[i].level) }
    }
  }

  module.exports = Logger
  // window.SimpleLogger = Logger;
})()
