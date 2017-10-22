const CookieSerializer = require('./CookieSerializer');
const cookieSerializer = new CookieSerializer();

class CookieManager {
    get(key, defaultValue) {
        var raw = localStorage.getItem(key);
        if (!raw)
            return defaultValue;
        return cookieSerializer.deserialize(raw);
    }

    set(key, value) {
        var serialized = cookieSerializer.serialize(value);
        return localStorage.setItem(key, serialized);
    }

    remove(key) {
        return localStorage.removeItem(key);
    }

    clear() {
        return localStorage.clear();
    }

    getAll() {
        return cookieSerializer.deserializeAll(
            JSON.parse(JSON.stringify(localStorage)));
    }
}

module.exports = CookieManager;