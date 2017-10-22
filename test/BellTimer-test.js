const assert = require('assert');

describe('BellTimer', function() {
    const BellTimer = require('../src/BellTimer');
    const CookieManager = require('../src/CookieManager2');
    const RequestManager = require('../src/RequestManager');


    describe('#constructor', function() {
        it('test cookie manager is set', function() {
            var cookieManager = new CookieManager();
            var requestManager = new RequestManager(cookieManager);
            var bellTimer = new BellTimer(cookieManager, requestManager);
            assert(bellTimer.cookieManager == cookieManager);
        });
        it('test request manager is set', function() {
            var cookieManager = new CookieManager();
            var requestManager = new RequestManager(cookieManager);
            var bellTimer = new BellTimer(cookieManager, requestManager);
            assert(bellTimer.requestManager == requestManager);
        });
        it('set dev mode with dev_mode cookie', function() {
            var cookieManager = new CookieManager();
            cookieManager.set('dev_mode', {
                startDate: '2017-10-20',
                scale: 2
            });
            var requestManager = new RequestManager(cookieManager);
            var bellTimer = new BellTimer(cookieManager, requestManager);
            assert(bellTimer.devMode == true);
            assert(bellTimer.timeScale == 2);
        });
    });

    describe('#loadCustomCourses', function() {});
});