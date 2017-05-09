/**
  *A module that does what it sounds like: it manages cookies.
  */
(function() {

  var CookieManager = function(Cookies) {
    this.Cookies = Cookies;
  };

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