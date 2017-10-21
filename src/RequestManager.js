const cookieManager = require('./CookieManager2');
const $ = require('jquery');

const cache = 'requestCache';

const RequestManager = {
  get: async function(url, defaultValue) {
    var result;
    try {
      result = await RequestManager.getNoCache(url);
      RequestManager.cache(url, result);
    } catch (e) {
      result = RequestManager.getCached(url);
    }
    return result || defaultValue;
  },
  getNoCache: async function(url) {
    return await $.get(`${url}?_v=${Date.now()}`);
  },
  getCached: function(url) {
    var cached = RequestManager.getAllCached();
    return cached[url];
  },
  getAllCached: function() {
    return cookieManager.get(cache, {});
  },
  setAllCached: function(all) {
    return cookieManager.set(cache, all);
  },
  cache: function(url, data) {
    var cached = RequestManager.getAllCached();
    cached[url] = data;
    return RequestManager.setAllCached(cached);
  }
};

module.exports = RequestManager;