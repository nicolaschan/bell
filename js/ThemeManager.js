const _ = require('lodash');

/**
 * Manages themes. If there is no value stored in the 'theme' cookie, it will
 * use the default theme instead.
 */
(function() {

  const cookieName = 'theme';
  const defaultTheme = 'Default - Light';

  /**
   * Given a string of the form hh:mm:ss, i.e. 10:30:21 (at least that's what Nicolas
   * promised me it does), returns an array of 3 integers specifying the time.
   * @param {String} time a string representing the time.
   * @return {int[]} an array containing integers [hh, mm, ss].
   */
  var parseTimeRemainingString = function(time) {
    var parts = _.map(time.split(':'), _.parseInt);
    var hour = (parts.length > 2) ? parts[0] : 0;
    var min = _.nth(parts, -2);
    var sec = _.nth(parts, -1);

    return [hour, min, sec];
  };
  /**
   * Given
   * @param {String -> String[]} colors a partially applied function that returns 4 arrays of color strings (which is
   * how themes are stored),
   * @param {String} time the current time string,
   * @return {String[]} the appropriate array of 3 color strings.
   */
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
  /**
    * Stores color schemes for each theme.
    * @return {String -> String[]} a partially applied function that takes a time as an argument, and returns
    * an array x of 3 colors where x[0] is the color of the time text, x[1] is the color
    * of the period description, and x[2] is the background color.
    */
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
        return ['black', 'black', 'lime'];
      if (sec > 2)
        return ['black', 'black', 'cyan'];
      else
        return ['black', 'black', 'magenta'];
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
        return ['lime', 'white', 'black'];
      if (sec > 2)
        return ['cyan', 'white', 'black'];
      else
        return ['magenta', 'white', 'black'];
    }
  };

  /**
   * Initializes a new ThemeManager object.
   * @param {CookieManager} cookieManager the appropriate CookieManager to find the theme cookie.
   */
  var ThemeManager = function(cookieManager) {
    this.cookieManager = cookieManager;
  };

  /**
   * Gets the current theme. If the current theme were to somehow not to be in the 
   * themes object, it would throw a nullpointerexception, but that should hopefully
   * never happen.
   * @return {String -> String[]} the partially applied function representing the current theme.
   */
  ThemeManager.prototype.getCurrentTheme = function() {
    return themes[this.getCurrentThemeName()];
  };
  /**
   * @return {String} the name of the current theme. Duh.
   */
  ThemeManager.prototype.getCurrentThemeName = function() {
    if (!this.cookieManager.get(cookieName))
      this.cookieManager.set(cookieName, defaultTheme);
    return this.cookieManager.get(cookieName);
  };
  /**
   * Sets the current theme by changing the value stored in the cookie.
   * @param {String} themeName the name of the new theme to be set.
   */
  ThemeManager.prototype.setCurrentTheme = function(themeName) {
    return this.cookieManager.set(cookieName, themeName);
  };
  /**
   * @return {Object} the object/map of partially applied functions representing themes.
   */
  ThemeManager.prototype.getAvailableThemes = function() {
    return themes;
  };

  module.exports = ThemeManager;
  //window.ThemeManager = ThemeManager;
})();