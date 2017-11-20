const localForage = require('localforage');

class CookieManager {
    constructor(storage) {
        this.cache = {};
        this.storage = localForage.createInstance({
            name: 'countdown_1'
        });;
    }

    async initialize() {
        var keys = await this.storage.keys();
        for (let key of keys) {
            this.cache[key] = await this.storage.getItem(key);
        }
    }

    get(key, defaultValue) {
        return this.cache[key] || defaultValue;
    }

    set(key, value) {
        this.cache[key] = value;
        return this.storage.setItem(key, value);
    }

    remove(key) {
        delete this.cache[key];
        return this.storage.removeItem(key);
    }

    clear() {
        return this.storage.clear();
    }

    get keys() {
        return this.storage.keys();
    }

    getAll() {
        return this.cache;
    }

    converted(version) {
        var converted = this.get('converted', []);
        return converted.indexOf(version) > -1;
    }

    addConverted(version) {
        if (this.converted(version))
            return;
        var converted = this.get('converted', []);
        converted.push(version);
        return this.set('converted', converted);
    }

    async convertLegacy(cookieManager, version) {
        if (version == 2 && !this.converted(2)) {
            console.log('Converting version', version, 'cookies');
            var all = {};
            try {
                all = cookieManager.getAll();
            } catch (e) {
                console.error('Cookies were corrupted');
            }
            for (let key in all) {
                await this.set(key, all[key]);
            }
            cookieManager.clear();
            this.addConverted(2);
        }
    }
}

module.exports = CookieManager;