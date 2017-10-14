const LZUTF8 = require('lzutf8');

const CookieManager = {
  get: function(key) {
    var raw = localStorage.getItem(key);
    if (!raw)
      return null;
    var decompressed = LZUTF8.decompress(raw, {
      inputEncoding: 'BinaryString'
    });
    return JSON.parse(decompressed);
  },
  getDefault: function(key, defaultValue) {
    var value = CookieManager.get(key);
    if (!value)
      CookieManager.set(key, defaultValue);
    return CookieManager.get(key);
  },
  set: function(key, value) {
    var compressed = LZUTF8.compress(JSON.stringify(value), {
      outputEncoding: 'BinaryString'
    });
    return localStorage.setItem(key, compressed);
  },
  remove: function(key) {
    return localStorage.removeItem(key);
  },
  clear: function() {
    localStorage.clear();
  }
};

module.exports = CookieManager;