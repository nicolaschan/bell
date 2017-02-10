(function() {

  var CookieManager = function(Cookies) {
    this.Cookies = Cookies;
  };

  CookieManager.prototype.set = function(key, value, expires) {
    return this.Cookies.set(key, value, {
      expires: (expires) ? 365 : null
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