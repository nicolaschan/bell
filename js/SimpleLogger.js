(function() {
  var Logger = function() {};
  var getTimestamp = function() {
    return new Date().toTimeString().substring(0, 8);
  };
  Logger.prototype.log = function(message, prefix, color) {
    console.log('%c' + getTimestamp() + ' %c' + prefix + '%c: ' + message, 'color:gray;', 'color:' + color + ';font-weight:600;', 'color:black;');
  };
  Logger.prototype.warn = console.warn;
  Logger.prototype.error = console.error;

  Logger.prototype.success = function(message) {
    Logger.prototype.log(message, 'success', 'green');
  };
  Logger.prototype.info = function(message) {
    Logger.prototype.log(message, 'info', 'blue');
  };
  Logger.prototype.debug = function(message) {
    Logger.prototype.log(message, 'debug', 'gray');
  };

  module.exports = Logger;
  //window.SimpleLogger = Logger;
})();