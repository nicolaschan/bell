const cookieManager = require('./CookieManager2');
const $ = require('jquery');

const cache = 'requestCache';

const RequestManager = {
  get: async function(url) {
    var result;
    try {
      result = await RequestManager.getNoCache(url);
      RequestManager.cache(url, result);
    } catch (e) {
      result = RequestManager.getCached(url);
    }
    return result;
  },
  getNoCache: async function(url) {
    return await $.get(`${url}?_v=${Date.now()}`);
  },
  getDefault: async function(url, defaultValue) {
    var result = await RequestManager.get(url);
    return result || defaultValue;
  },
  getCached: function(url) {
    var cached = RequestManager.getAllCached();
    return cached[url];
  },
  getAllCached: function() {
    return cookieManager.getDefault(cache, {});
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