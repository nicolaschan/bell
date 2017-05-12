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
    // [text, subtitle, background, popup background]
    'Default - Light': _.partial(getCurrentColorDefaultTiming, [
      ['black', 'black', 'lime', 'white'],
      ['black', 'black', 'yellow', 'white'],
      ['black', 'black', 'orange', 'white'],
      ['black', 'black', 'red', 'white']
    ]),
    'Default - Dark': _.partial(getCurrentColorDefaultTiming, [
      ['lime', 'white', 'black', '#555555'],
      ['yellow', 'white', 'black', '#555555'],
      ['orange', 'white', 'black', '#555555'],
      ['red', 'white', 'black', '#555555']
    ]),
    'Grays - Light': _.partial(getCurrentColorDefaultTiming, [
      ['black', 'black', 'darkgray', 'white'],
      ['black', 'black', 'silver', 'white'],
      ['black', 'black', 'lightgray', 'white'],
      ['black', 'black', 'white', 'white']
    ]),
    'Grays - Dark': _.partial(getCurrentColorDefaultTiming, [
      ['darkgray', 'white', 'black', '#555555'],
      ['silver', 'white', 'black', '#555555'],
      ['lightgray', 'white', 'black', '#555555'],
      ['white', 'white', 'black', '#555555']
    ]),
    'Pastel - Light': _.partial(getCurrentColorDefaultTiming, [
      ['black', 'black', '#bcffae', 'white'],
      ['black', 'black', '#fff9b0', 'white'],
      ['black', 'black', '#ffcfa5', 'white'],
      ['black', 'black', '#ffbfd1', 'white']
    ]),
    'Pastel - Dark': _.partial(getCurrentColorDefaultTiming, [
      ['#bcffae', 'white', 'black', '#555555'],
      ['#fff9b0', 'white', 'black', '#555555'],
      ['#ffcfa5', 'white', 'black', '#555555'],
      ['#ffbfd1', 'white', 'black', '#555555']
    ]),
    'Blues - Light': _.partial(getCurrentColorDefaultTiming, [
      ['black', 'black', '#ccffff', 'white'],
      ['black', 'black', '#33ccff', 'white'],
      ['black', 'black', '#0066ff', 'white'],
      ['black', 'black', '#002db3', 'white']
    ]),
    'Blues - Dark': _.partial(getCurrentColorDefaultTiming, [
      ['#ccffff', 'white', 'black', '#555555'],
      ['#33ccff', 'white', 'black', '#555555'],
      ['#0066ff', 'white', 'black', '#555555'],
      ['#002db3', 'white', 'black', '#555555']
    ]),
    'Rainbow - Light': function(time) {
      var time = parseTimeRemainingString(time);
      var sec = time[2] % 12;

      if (sec > 10)
        return ['black', 'black', 'red', 'white'];
      if (sec > 8)
        return ['black', 'black', 'orange', 'white'];
      if (sec > 6)
        return ['black', 'black', 'yellow', 'white'];
      if (sec > 4)
        return ['black', 'black', 'lime', 'white'];
      if (sec > 2)
        return ['black', 'black', 'cyan', 'white'];
      else
        return ['black', 'black', 'magenta', 'white'];
    },
    'Rainbow - Dark': function(time) {
      var time = parseTimeRemainingString(time);
      var sec = time[2] % 12;

      if (sec > 10)
        return ['red', 'white', 'black', '#555555'];
      if (sec > 8)
        return ['orange', 'white', 'black', '#555555'];
      if (sec > 6)
        return ['yellow', 'white', 'black', '#555555'];
      if (sec > 4)
        return ['lime', 'white', 'black', '#555555'];
      if (sec > 2)
        return ['cyan', 'white', 'black', '#555555'];
      else
        return ['magenta', 'white', 'black', '#555555'];
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