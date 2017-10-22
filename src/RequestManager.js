const $ = require('jquery');

const cache = 'requestCache';

class RequestManager {
    constructor(cookieManager, host) {
        if (host) {
            var lastChar = host.substring(host.length - 1);
            this.host = (lastChar == '/') ? host.substring(0, host.length - 1) : host;
        } else {
            this.host = '';
        }
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

    generateUrl(url) {
        return `${this.host}${url}?_v=${Date.now()}`;
    }

    getNoCache(url) {
        return $.get(this.generateUrl(url));
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

    clearCache() {
        return this.cookieManager.remove(cache);
    }
}

module.exports = RequestManager;