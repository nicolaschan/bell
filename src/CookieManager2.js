const LZUTF8 = require('lzutf8');

const CookieManager = {
  get: function(key, defaultValue) {
    var raw = localStorage.getItem(key);
    if (!raw)
      return defaultValue;
    var decompressed = LZUTF8.decompress(raw, {
      inputEncoding: 'BinaryString'
    });
    return JSON.parse(decompressed);
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