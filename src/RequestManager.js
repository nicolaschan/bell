const $ = require('jquery');

const cache = 'requestCache';

class RequestManager {
    constructor(cookieManager, host, request) {
        if (host) {
            var lastChar = host.substring(host.length - 1);
            this.host = (lastChar == '/') ? host.substring(0, host.length - 1) : host;
        } else {
            this.host = '';
        }
        this.cookieManager = cookieManager;

        $.ajaxSetup({
            timeout: 1000
        });
        this.request = request || (url => {
            if (navigator.onLine) // Saves time waiting if offline
                return $.get(url);
            else
                throw new Error('Request failed');
        });
    }

    async get(url, defaultValue) {
        var result;
        try {
            result = await this.getNoCache(url);
        } catch (e) {
            result = this.getCached(url);
        }
        this.cache(url, result);
        return result || defaultValue;
    }

    generateUrl(url) {
        return `${this.host}${url}?_v=${Date.now()}`;
    }

    async getNoCache(url) {
        var result;
        try {
            result = await this.request(this.generateUrl(url));
        } catch (e) {
            throw new Error('Request failed');
        }
        return result;
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