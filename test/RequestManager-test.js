const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('RequestManager', function() {
    const CookieManager = require('../src/CookieManager2');
    const RequestManager = require('../src/RequestManager');

    beforeEach(function() {
        this.cookieManager = new CookieManager();
        this.requestManager = new RequestManager(this.cookieManager);
    });

    describe('#constructor', function() {
        it('test cookie manager is set', function() {
            expect(this.requestManager.cookieManager).to.equal(this.cookieManager);
        });
        it('test host is set', function() {
            var requestManager = new RequestManager(this.cookieManager, 'https://example.com');
            requestManager.host.should.equal('https://example.com');
        });
        it('removes trailing / from host', function() {
            var requestManager = new RequestManager(this.cookieManager, 'https://example.com/');
            requestManager.host.should.equal('https://example.com');
        });
        it('test host is empty string if not provided', function() {
            this.requestManager.host.should.equal('');
        });
        it('test request is set', function() {
            var request = url => new Promise((resolve, reject) => resolve('data'));
            var requestManager = new RequestManager(this.cookieManager, '', request);
            requestManager.request.should.equal(request);
        });
        it('there is some default request function', function() {
            this.requestManager.request.get.should.be.a('function');
            this.requestManager.request.post.should.be.a('function');
        });
    });

    describe('#get', function() {
        beforeEach(function() {
            this.requestManager = new RequestManager(this.cookieManager, '', {
                post: (url, data) => {
                    return {
                        success: true
                    };
                },
                get: url => {
                    url = url.split('?')[0];
                    var data = {
                        '/api/data': 'some data',
                        '/api/data2': 'two datas'
                    };
                    var result = data[url];
                    if (result)
                        return result;
                    else
                        throw new Error('not found');
                }
            });
        });

        it('should get data', async function() {
            await this.requestManager.get('/api/data').should.eventually.equal('some data');
            await this.requestManager.get('/api/data2').should.eventually.equal('two datas');
        });
        it('not found path returns cached', async function() {
            this.requestManager.clearCache();
            this.requestManager.cache('/api/nothing', 'not here');
            await this.requestManager.get('/api/nothing').should.eventually.equal('not here');
        });
        it('not cached and not found should be undefined', async function() {
            await this.requestManager.get('/api/fail').should.eventually.be.undefined;
        });
        it('test with default with failing request returns undefined', async function() {
            var requestManager = new RequestManager(this.cookieManager);
            await requestManager.get('https://___.com/this/should/fail').should.eventually.be.undefined;
        });
        it('get with default with no cache to reject', async function() {
            var requestManager = new RequestManager(this.cookieManager);
            await requestManager.getNoCache('https://___.com/this/should/fail').should.be.rejected;
        });
        it('get with default with cache to work', async function() {
            var requestManager = new RequestManager(this.cookieManager);
            requestManager.cache('/api/hello', 'world');
            await requestManager.get('/api/hello').should.eventually.equal('world');
        });
        it('get with default with navigator offline to reject', async function() {
            var requestManager = new RequestManager(this.cookieManager, '', undefined, {
                onLine: false
            });
            await requestManager.getNoCache('https://___.com/this/should/fail').should.be.rejected;
        });
        it('post returns received data', async function() {
            var response = await this.requestManager.post('/api/some_path');
            response.should.deep.equal({
                success: true
            });
        });
        it('post with default with bad url to reject', async function() {
            var requestManager = new RequestManager(this.cookieManager);
            await requestManager.post('https://___.com/this/should/fail').should.be.rejected;
        });
        it('post with default with navigator offline to reject', async function() {
            var requestManager = new RequestManager(this.cookieManager, '', undefined, {
                onLine: false
            });
            await requestManager.post('https://___.com/this/should/fail').should.be.rejected;
        });
    });

    describe('#cache', function() {
        it('set cache', function() {
            this.requestManager.clearCache();
            this.requestManager.cache('/api/data', 'some data');
            this.requestManager.getCached('/api/data').should.equal('some data');
        });
    });

    describe('#generateUrl', function() {
        it('host should prepend to url', function() {
            var requestManager = new RequestManager(this.cookieManager, 'https://example.com');
            var url = requestManager.generateUrl('/api/data');
            url.indexOf('https://example.com/api/data?_v=').should.equal(0);
        });
    });

    describe('#clearCache', function() {
        it('clear cache', function() {
            this.requestManager.cache('/api/data', 'some data');
            this.requestManager.clearCache();

            expect(this.requestManager.getCached('/api/data')).to.be.undefined;
        });
    });
});