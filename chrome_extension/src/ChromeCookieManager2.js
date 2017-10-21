const CookieSerializer = require('../../src/CookieSerializer');
const cookieSerializer = new CookieSerializer();

class CookieManager {
    constructor(port) {
        this.port = port;
        this.cookies = {};

        this.addListener(msg => this.cookies = msg.value);
    }

    addListener(listener) {
        this.port.onMessage.addListener(listener);
        this.port.onMessage.removeListener(this.listener);
        this.listener = listener;
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
    var port = await new Promise((resolve, reject) => {
        chrome.runtime.onConnectExternal.addListener(resolve);
    });
    return new CookieManager(port);
};

module.exports = CookieManagerFactory;