const $ = require('jquery');

const cache = 'requestCache';

class RequestManager {
    constructor(cookieManager, host) {
        this.host = host || '';
        this.cookieManager = cookieManager;
    }

    async get(url, defaultValue) {
        var result;
        try {
            result = await this.getNoCache(url);
            this.cache(url, result);
        } catch (e) {
            result = this.getCached(url);
        }
        return result || defaultValue;
    }

    getNoCache(url) {
        return $.get(`${this.host}${url}?_v=${Date.now()}`);
    }

    getCached(url) {
        var cached = this.getAllCached();
        return cached[url];
    }

    getAllCached() {
        return this.cookieManager.get(cache, {});
    }

    setAllCached(all) {
        return this.cookieManager.set(cache, all);
    }

    cache(url, data) {
        var cached = this.getAllCached();
        cached[url] = data;
        return this.setAllCached(cached);
    }
}

module.exports = RequestManager;