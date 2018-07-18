/* global describe, it, beforeEach */

const chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe('RequestManager', function () {
  const RequestManager = require('../src/RequestManager')

  beforeEach(function () {
    this.requestManager = new RequestManager({
      post: (url, data) => {
        return {
          success: true
        }
      },
      get: url => {
        url = url.split('?')[0]
        var data = {
          '/api/data': 'some data',
          '/api/data2': 'two datas'
        }
        var result = data[url]
        if (result) { return result } else { throw new Error('not found') }
      }
    })
  })

  describe('#constructor', function () {
    it('test request is set', function () {
      var request = url => new Promise((resolve, reject) => resolve('data'))
      var requestManager = new RequestManager(request)
      requestManager.request.should.equal(request)
    })
    it('should have no logs at the beginning', function () {
      var requestManager = new RequestManager({})
      requestManager.logged.should.deep.equal({})
    })
  })

  describe('#get', function () {
    it('should get data', async function () {
      await this.requestManager.get('/api/data').should.eventually.equal('some data')
      await this.requestManager.get('/api/data2').should.eventually.equal('two datas')
    })
    it('not found path should be rejected', async function () {
      return this.requestManager.get('/api/nothing').should.eventually.be.rejectedWith('Request failed: GET /api/nothing')
    })
    it('post returns received data', async function () {
      var response = await this.requestManager.post('/api/some_path')
      response.should.deep.equal({
        success: true
      })
    })
    it('post with default with bad url to reject', async function () {
      var requestManager = new RequestManager(this.cookieManager)
      await requestManager.post('https://___.com/this/should/fail').should.be.rejected
    })
    it('post with default with navigator offline to reject', async function () {
      var requestManager = new RequestManager(this.cookieManager, '', undefined, {
        onLine: false
      })
      await requestManager.post('https://___.com/this/should/fail').should.be.rejected
    })
  })

  describe('#getSync', function () {
    it('should get data synchronously after first request', async function () {
      await this.requestManager.get('/api/data')
      this.requestManager.getSync('/api/data').should.equal('some data')
    })
    it('should not send a requset within the timeout', async function () {
      var requests = 0
      var requestManager = new RequestManager({
        get: async (url) => {
          requests++
          return 'some data'
        }
      })
      await requestManager.get('/api/data')
      requestManager.getSync('/api/data')
      requestManager.getSync('/api/data')
      requests.should.equal(1)
    })
    it('should send a request if throttle has timed out', async function () {
      var requests = 0
      var requestManager = new RequestManager({
        get: async (url) => {
          requests++
          return 'some data'
        }
      })
      await requestManager.get('/api/data')
      requestManager.getThrottled('/api/data', undefined, 0)
      requests.should.equal(2)
    })
  })
})
