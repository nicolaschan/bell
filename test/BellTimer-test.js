const assert = require('assert');

describe('BellTimer', function() {
    const BellTimer = require('../src/BellTimer');
    const CookieManager = require('../src/CookieManager2');
    const RequestManager = require('../src/RequestManager');

    describe('#constructor', function() {
        var cookieManager = new CookieManager();
        var requestManager = new RequestManager();
        var bellTimer = new BellTimer(cookieManager, requestManager);

        it('test cookie manager is set', function() {
            assert(bellTimer.cookieManager == cookieManager);
        });
    });
});