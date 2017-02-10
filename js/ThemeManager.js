const _ = require('lodash');

(function() {

  const cookieName = 'theme';
  const defaultTheme = 'Default - Light';

  var parseTimeRemainingString = function(time) {
    var parts = _.map(time.split(':'), _.parseInt);
    var hour = (parts.length > 2) ? parts[0] : 0;
    var min = _.nth(parts, -2);
    var sec = _.nth(parts, -1);

    return [hour, min, sec];
  };
  var getCurrentColorDefaultTiming = function(colors, time) {
    var parts = parseTimeRemainingString(time);
    var min = parts[1] + (60 * parts[0]);

    if (min < 2)
      return _.nth(colors, -1);
    if (min < 5)
      return _.nth(colors, -2);
    if (min < 15)
      return _.nth(colors, -3);
    else
      return _.nth(colors, -4);
  };
  var themes = {
    'Default - Light': _.partial(getCurrentColorDefaultTiming, [
      ['black', 'black', 'lime'],
      ['black', 'black', 'yellow'],
      ['black', 'black', 'orange'],
      ['black', 'black', 'red']
    ]),
    'Default - Dark': _.partial(getCurrentColorDefaultTiming, [
      ['lime', 'white', 'black'],
      ['yellow', 'white', 'black'],
      ['orange', 'white', 'black'],
      ['red', 'white', 'black']
    ]),
    'Grays - Light': _.partial(getCurrentColorDefaultTiming, [
      ['black', 'black', 'darkgray'],
      ['black', 'black', 'silver'],
      ['black', 'black', 'lightgray'],
      ['black', 'black', 'white']
    ]),
    'Grays - Dark': _.partial(getCurrentColorDefaultTiming, [
      ['darkgray', 'white', 'black'],
      ['silver', 'white', 'black'],
      ['lightgray', 'white', 'black'],
      ['white', 'white', 'black']
    ]),
    'Pastel - Light': _.partial(getCurrentColorDefaultTiming, [
      ['black', 'black', '#bcffae'],
      ['black', 'black', '#fff9b0'],
      ['black', 'black', '#ffcfa5'],
      ['black', 'black', '#ffbfd1']
    ]),
    'Pastel - Dark': _.partial(getCurrentColorDefaultTiming, [
      ['#bcffae', 'white', 'black'],
      ['#fff9b0', 'white', 'black'],
      ['#ffcfa5', 'white', 'black'],
      ['#ffbfd1', 'white', 'black']
    ]),
    'Blues - Light': _.partial(getCurrentColorDefaultTiming, [
      ['black', 'black', '#ccffff'],
      ['black', 'black', '#33ccff'],
      ['black', 'black', '#0066ff'],
      ['black', 'black', '#002db3']
    ]),
    'Blues - Dark': _.partial(getCurrentColorDefaultTiming, [
      ['#ccffff', 'white', 'black'],
      ['#33ccff', 'white', 'black'],
      ['#0066ff', 'white', 'black'],
      ['#002db3', 'white', 'black']
    ]),
    'Rainbow - Light': function(time) {
      var time = parseTimeRemainingString(time);
      var sec = time[2] % 12;

      if (sec > 10)
        return ['black', 'black', 'red'];
      if (sec > 8)
        return ['black', 'black', 'orange'];
      if (sec > 6)
        return ['black', 'black', 'yellow'];
      if (sec > 4)
        return ['black', 'black', 'green'];
      if (sec > 2)
        return ['black', 'black', 'blue'];
      else
        return ['black', 'black', 'purple'];
    },
    'Rainbow - Dark': function(time) {
      var time = parseTimeRemainingString(time);
      var sec = time[2] % 12;

      if (sec > 10)
        return ['red', 'white', 'black'];
      if (sec > 8)
        return ['orange', 'white', 'black'];
      if (sec > 6)
        return ['yellow', 'white', 'black'];
      if (sec > 4)
        return ['green', 'white', 'black'];
      if (sec > 2)
        return ['blue', 'white', 'black'];
      else
        return ['purple', 'white', 'black'];
    }
  };

  var ThemeManager = function(cookieManager) {
    this.cookieManager = cookieManager;
  };

  ThemeManager.prototype.getCurrentTheme = function() {
    return themes[this.getCurrentThemeName()];
  };
  ThemeManager.prototype.getCurrentThemeName = function() {
    if (!this.cookieManager.get('theme'))
      this.cookieManager.set('theme', defaultTheme);
    return this.cookieManager.get('theme');
  };
  ThemeManager.prototype.setCurrentTheme = function(themeName) {
    return this.cookieManager.set('theme', themeName);
  };
  ThemeManager.prototype.getAvailableThemes = function() {
    return themes;
  };

  module.exports = ThemeManager;
  //window.ThemeManager = ThemeManager;
})();