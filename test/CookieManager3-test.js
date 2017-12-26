/* global describe, it, beforeEach */

const assert = require('assert')
const chai = require('chai')
chai.should()
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe('CookieManager', function () {
  const CookieManager = require('../src/CookieManager3')
  beforeEach(async function () {
    this.cookieManager = new CookieManager()
    return this.cookieManager.initialize()
  })

  describe('#set', function () {
    it('set then get works', function () {
      this.cookieManager.clear()
      var key = 'key1'
      var val = 'val1'
      this.cookieManager.set(key, val)
      assert(this.cookieManager.get(key) === val)
    })
  })

  describe('#get', function () {
    it('return default value if no value for key', function () {
      this.cookieManager.clear()
      var val = this.cookieManager.get('not here', 'default')
      assert(val === 'default')
    })
    it('get with no params is same as getAll', function () {
      this.cookieManager.clear()
      this.cookieManager.set('key1', 'val1')
      assert(this.cookieManager.getAll()['key1'] === this.cookieManager.get()['key1'])
    })
  })

  describe('#clear', function () {
    it('previously set values are cleared with clear()', function () {
      this.cookieManager.set('key2', 'val2')
      this.cookieManager.clear()
      assert(this.cookieManager.get('key2') === undefined)
    })

    it('no keys remain after cleared', function () {
      this.cookieManager.set('key2', 'val2')
      this.cookieManager.clear()
      assert(Object.keys(this.cookieManager.getAll()).length === 0)
    })
  })

  describe('#remove', function () {
    it('removed values are undefined', function () {
      this.cookieManager.set('key5', 'val5')
      this.cookieManager.set('key6', 'val6')
      this.cookieManager.remove('key5')
      assert(this.cookieManager.get('key5') === undefined)
    })
    it('remove does not affect other values', function () {
      this.cookieManager.set('key5', 'val5')
      this.cookieManager.set('key6', 'val6')
      this.cookieManager.remove('key5')
      assert(this.cookieManager.get('key6') === 'val6')
    })
  })

  describe('#getAll', function () {
    it('get all returns an object with the values', function () {
      this.cookieManager.clear()
      this.cookieManager.set('key3', 'val3')
      this.cookieManager.set('key4', 'val4')
      var all = this.cookieManager.getAll()
      assert(all['key3'] === 'val3')
      assert(all['key4'] === 'val4')
    })

    it('there are no extra values returned with getAll', function () {
      this.cookieManager.clear()
      this.cookieManager.set('key3', 'val3')
      this.cookieManager.set('key4', 'val4')
      var all = this.cookieManager.getAll()
      assert(Object.keys(all).length === 2)
    })
  })

  describe('#keys', function () {
    it('gets all keys correctly', async function () {
      await this.cookieManager.clear()
      await this.cookieManager.set('key1', 'val1')
      await this.cookieManager.set('key2', 'val2')
      return this.cookieManager.keys.should.eventually.deep.equal(['key1', 'key2'])
    })
  })
})
