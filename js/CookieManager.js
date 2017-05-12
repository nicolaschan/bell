/**
  * A module that does what it sounds like: it manages cookies.
  * Should be used with some other API that does real cookie stuff, like
  * https://www.npmjs.com/package/js-cookie.
  */
(function() {

  var CookieManager = function(Cookies) {
    this.Cookies = Cookies;
  };

  /**
   * Sets a cookie by its name and the value to set it to.
   * 
   * @param {String} key the name of the cookie to be set. It hopefully exists.
   * @param value the new value of the cookie.
   * @param {int} (optional) the number of days until expiration. If this is not 
   * specified, it defaults to 365.
   */
  CookieManager.prototype.set = function(key, value, expires) {
    this.Cookies.remove(key);
    return this.Cookies.set(key, value, {
      expires: (expires) ? expires : 365
    });
  };
  CookieManager.prototype.get = function(key) {
    return this.Cookies.get(key);
  };
  CookieManager.prototype.getJSON = function(key) {
    return this.Cookies.getJSON(key);
  };

  var splitString = function(str, length) {
    var parts = [];
    for (var i = 0; i < str.length; i += length) {
      parts.push(str.substring(i, i + length));
    }
    return parts;
  };
  CookieManager.prototype.getLong = function(key) {
    var longValue = '';
    for (var i = 0; this.get(key + '_' + i); i++) {
      longValue += this.get(key + '_' + i);
    }
    return longValue;
  };
  CookieManager.prototype.getLongJSON = function(key) {
    return JSON.parse(this.getLong(key));
  };
  CookieManager.prototype.setLong = function(key, longValue, expires) {
    for (var i = 0; this.get(key + '_' + i); i++)
      this.Cookies.remove(key + '_' + i);
    if (typeof longValue != 'string')
      longValue = JSON.stringify(longValue);
    var parts = splitString(longValue, 2000);
    for (var i = 0; i < parts.length; i++) {
      this.set(key + '_' + i, parts[i], expires);
    }
  };

  module.exports = CookieManager;
  //window.CookieManager = CookieManager;
})();