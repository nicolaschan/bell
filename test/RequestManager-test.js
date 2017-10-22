const assert = require('assert');

describe('RequestManager', function() {
    const CookieManager = require('../src/CookieManager2');
    const RequestManager = require('../src/RequestManager');

    beforeEach(function() {
        this.cookieManager = new CookieManager();
        this.requestManager = new RequestManager(this.cookieManager);
    });

    describe('#constructor', function() {
        it('test cookie manager is set', function() {
            assert(this.requestManager.cookieManager == this.cookieManager);
        });
        it('test host is set', function() {
            var requestManager = new RequestManager(this.cookieManager, 'https://example.com');
            assert(requestManager.host == 'https://example.com');
        });
        it('removes trailing / from host', function() {
            var requestManager = new RequestManager(this.cookieManager, 'https://example.com/');
            assert(requestManager.host == 'https://example.com');
        });
        it('test host is empty string if not provided', function() {
            assert(this.requestManager.host == '');
        });
    });

    describe('#get', function() {

    });

    describe('#cache', function() {
        it('set cache', function() {
            this.requestManager.cache('/api/data', 'some data');
            assert(this.requestManager.getCached('/api/data') == 'some data');
        });
    });

    describe('#generateUrl', function() {
        it('host should prepend to url', function() {
            var requestManager = new RequestManager(this.cookieManager, 'https://example.com');
            var url = requestManager.generateUrl('/api/data');
            assert(url.indexOf('https://example.com/api/data?_v=') == 0);
        });
    });

    describe('#clearCache', function() {
        it('clear cache', function() {
            this.requestManager.cache('/api/data', 'some data');
            this.requestManager.clearCache();
            assert(this.requestManager.getCached('/api/data') == undefined);
        });
    });
});