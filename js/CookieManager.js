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

  module.exports = CookieManager;
  //window.CookieManager = CookieManager;
})();