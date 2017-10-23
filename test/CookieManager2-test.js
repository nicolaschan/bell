const assert = require('assert');

describe('CookieManager', function() {
    const CookieManager = require('../src/CookieManager2');
    var cookieManager;

    describe('#constructor', function() {
        cookieManager = new CookieManager();
    });
    describe('#set', function() {
        cookieManager.clear();

        var key = 'key1';
        var val = 'val1';

        cookieManager.set(key, val);
        it('set then get works', function() {
            assert(cookieManager.get(key) == val);
        });
    });

    describe('#get', function() {
        it('return default value if no value for key', function() {
            cookieManager.clear();
            var val = cookieManager.get('not here', 'default');
            assert(val == 'default');
        });
        it('get with no params is same as getAll', function() {
            cookieManager.clear();
            cookieManager.set('key1', 'val1');
            assert(cookieManager.getAll()['key1'] == cookieManager.get()['key1']);
        });
    });

    describe('#clear', function() {
        it('previously set values are cleared with clear()', function() {
            cookieManager.set('key2', 'val2');
            cookieManager.clear();
            assert(cookieManager.get('key2') == undefined);
        });

        it('no keys remain after cleared', function() {
            cookieManager.set('key2', 'val2');
            cookieManager.clear();
            var all = cookieManager.getAll();
            assert(Object.keys(cookieManager.getAll()).length == 0);
        });
    });

    describe('#remove', function() {
        it('removed values are undefined', function() {
            cookieManager.set('key5', 'val5');
            cookieManager.set('key6', 'val6');
            cookieManager.remove('key5');
            assert(cookieManager.get('key5') == undefined);
        });
        it('remove does not affect other values', function() {
            cookieManager.set('key5', 'val5');
            cookieManager.set('key6', 'val6');
            cookieManager.remove('key5');
            assert(cookieManager.get('key6') == 'val6');
        });
    });

    describe('#getAll', function() {
        it('get all returns an object with the values', function() {
            cookieManager.clear();
            cookieManager.set('key3', 'val3');
            cookieManager.set('key4', 'val4');
            var all = cookieManager.getAll();
            assert(all['key3'] == 'val3');
            assert(all['key4'] == 'val4');
        });

        it('there are no extra values returned with getAll', function() {
            cookieManager.clear();
            cookieManager.set('key3', 'val3');
            cookieManager.set('key4', 'val4');
            var all = cookieManager.getAll();
            assert(Object.keys(all).length == 2);
        });
    });
});