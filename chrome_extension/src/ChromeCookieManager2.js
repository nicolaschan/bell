const $ = require('jquery');

const CookieSerializer = require('../../src/CookieSerializer');
const cookieSerializer = new CookieSerializer();

class CookieManager {
    constructor(cookies) {
        this.cookies = cookies;
        chrome.storage.local.clear(() =>
            chrome.storage.local.set(cookies));
    }

    get(key, defaultValue) {
        var raw = this.cookies[key];
        if (!raw)
            return defaultValue;
        return cookieSerializer.deserialize(raw);
    }

    set(key, value) {
        return this.cookies[key] = cookieSerializer.serialize(value);
    }

    remove(key) {
        return delete this.cookies[key];
    }

    clear() {
        return this.cookies = {};
    }
}

var CookieManagerFactory = async function() {
    if (window.countdownOnline) {
        var port = await new Promise((resolve, reject) =>
            chrome.runtime.onConnectExternal.addListener(resolve));

        var cookies = await new Promise((resolve, reject) => {
            port.onMessage.addListener(msg => resolve(msg.value));
        });
        return new CookieManager(cookies);
    }

    // Offline => get cookies from local storage
    var items = await new Promise((resolve, reject) =>
        chrome.storage.local.get(resolve));
    return new CookieManager(items);
};

module.exports = CookieManagerFactory;