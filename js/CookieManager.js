(function() {

  var CookieManager = function(Cookies) {
    this.Cookies = Cookies;
    this.lengthThreshold = 4000;
  };

  CookieManager.prototype.set = function(key, value, expires) {
    this.Cookies.remove(key);

    if (typeof value != 'string')
      value = JSON.stringify(value);
    var valueBase64 = btoa(value);
    if (valueBase64.length > this.lengthThreshold)
      return this.setLong(key, value, expires);

    return this.setRaw(key, valueBase64, expires);
  };
  CookieManager.prototype.setRaw = function(key, rawValue, expires) {
    this.Cookies.remove(key);

    return this.Cookies.set(key, rawValue, {
      expires: (expires) ? expires : 365
    });
  };
  CookieManager.prototype.get = function(key) {
    var valueBase64 = this.getRaw(key);
    try {
      return atob(valueBase64);
    } catch (e) {
      this.convertCookieToBase64(key); // for backwards compatibility
      return valueBase64;
    }
  };
  CookieManager.prototype.getRaw = function(key) {
    return this.Cookies.get(key);
  };
  CookieManager.prototype.convertCookieToBase64 = function(key) {
    this.set(key, this.getRaw(key));
  };
  CookieManager.prototype.getJSON = function(key) {
    try {
      return JSON.parse(this.get(key));
    } catch (e) {
      return undefined;
    }
  };

  var splitString = function(str, length) {
    var parts = [];
    for (var i = 0; i < str.length; i += length) {
      parts.push(str.substring(i, i + length));
    }
    return parts;
  };
  CookieManager.prototype.getLong = function(key) {
    var longValueBase64 = '';
    for (var i = 0; this.getRaw(key + '_' + i); i++) {
      longValueBase64 += this.getRaw(key + '_' + i);
    }
    try {
      return atob(longValueBase64);
    } catch (e) {
      return undefined;
    }
  };
  CookieManager.prototype.getLongJSON = function(key) {
    return JSON.parse(this.getLong(key));
  };
  CookieManager.prototype.setLong = function(key, longValue, expires) {
    for (var i = 0; this.getRaw(key + '_' + i); i++)
      this.Cookies.remove(key + '_' + i);
    if (typeof longValue != 'string')
      longValue = JSON.stringify(longValue);

    var longValueBase64 = btoa(longValue);
    var parts = splitString(longValueBase64, this.lengthThreshold);
    for (var i = 0; i < parts.length; i++) {
      this.setRaw(key + '_' + i, parts[i], expires);
    }
  };

  module.exports = CookieManager;
  //window.CookieManager = CookieManager;
})();