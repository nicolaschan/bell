/* global describe, it, beforeEach */

const chai = require('chai')
chai.should()
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe('BellTimer', function () {
  const BellTimer = require('../src/BellTimer')
  const CookieManager = require('../src/CookieManager2')
  const RequestManager = require('../src/RequestManager')

  describe('#constructor', function () {
    it('test cookie manager is set', function () {
      var cookieManager = new CookieManager()
      var requestManager = new RequestManager(cookieManager)
      var bellTimer = new BellTimer(cookieManager, requestManager)
      bellTimer.cookieManager.should.equal(cookieManager)
    })
    it('test request manager is set', function () {
      var cookieManager = new CookieManager()
      var requestManager = new RequestManager(cookieManager)
      var bellTimer = new BellTimer(cookieManager, requestManager)
      bellTimer.requestManager.should.equal(requestManager)
    })
    it('set dev mode with dev_mode cookie', function () {
      var cookieManager = new CookieManager()
      cookieManager.set('dev_mode', {
        startDate: '2017-10-20',
        scale: 2
      })
      var requestManager = new RequestManager(cookieManager)
      var bellTimer = new BellTimer(cookieManager, requestManager)
      bellTimer.devMode.should.equal(true)
      bellTimer.timeScale.should.equal(2)
    })
  })
  describe('#initialize', function () {
    beforeEach(async function () {
      var fakeRequester = async url => {
        url = url.split('?')[0]

        var data = {
          '/api/sources/names': ['school'],
          '/api/data/school/calendar': '* Default Week\nMon normal\nTue normal\nWed normal\nThu normal\nFri normal\nSat normal\nSun normal\n* Special Days\n10/21/2017 special\n10/22/2017 special # Event Day',
          '/api/data/school/correction': '20000',
          '/api/data/school/schedules': '* normal # Normal Schedule\n8:00 {Period 0}\n9:00 {Period 1}\n* special # Special Schedule\n10:00 {Period 0}\n11:00 Special Event'
        }

        var result = data[url]
        if (result) { return result } else { throw new Error('Request failed') }
      }
      var cookieManager = new CookieManager()
      var requestManager = new RequestManager(cookieManager, '', {
        get: fakeRequester,
        post: () => {}
      })
      cookieManager.set('source', 'school')
      cookieManager.set('periods', {
        'Period 0': 'First Period'
      })
      var bellTimer = new BellTimer(cookieManager, requestManager)
      await bellTimer.initialize()
      this.bellTimer = bellTimer
    })

    it('should retrieve normal schedule correctly', function () {
      this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0)
      this.bellTimer.getCurrentSchedule().name.should.equal('normal')
      this.bellTimer.getCurrentSchedule().display.should.equal('Normal Schedule')
    })
    it('should retrieve special schedules correctly', function () {
      this.bellTimer.enableDevMode('2017-10-21 8:30:00', 0)
      this.bellTimer.getCurrentSchedule().name.should.equal('special')
      this.bellTimer.getCurrentSchedule().display.should.equal('Special Schedule')
    })
    it('custom period names should replace default', function () {
      this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0)
      this.bellTimer.getCurrentPeriod().name.should.equal('First Period')
    })
    it('default period name is in curly braces', function () {
      this.bellTimer.enableDevMode('2017-10-20 9:30:00', 0)
      this.bellTimer.getCurrentPeriod().name.should.equal('Period 1')
    })
    it('set correction correctly', function () {
      this.bellTimer.getCorrection().should.equal(20000)
    })
    it('calendar should be set correctly', function () {
      this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0)
      this.bellTimer.calendar.week.should.deep.equal({
        'Mon': {
          name: 'normal'
        },
        'Tue': {
          name: 'normal'
        },
        'Wed': {
          name: 'normal'
        },
        'Thu': {
          name: 'normal'
        },
        'Fri': {
          name: 'normal'
        },
        'Sat': {
          name: 'normal'
        },
        'Sun': {
          name: 'normal'
        }
      })
      this.bellTimer.calendar.special.should.deep.equal({
        '10/21/2017': {
          name: 'special'
        },
        '10/22/2017': {
          name: 'special',
          display: 'Event Day'
        }
      })
    })
  })
  describe('custom schedules', function () {
    beforeEach(async function () {
      var fakeRequester = async url => {
        url = url.split('?')[0]

        var data = {
          '/api/sources/names': ['school'],
          '/api/data/school/calendar': '* Default Week\nMon normal\nTue normal\nWed normal\nThu normal\nFri normal\nSat normal\nSun normal\n* Special Days\n10/21/2017 special\n10/22/2017 special # Event Day',
          '/api/data/school/correction': '20000',
          '/api/data/school/schedules': '* normal # Normal Schedule\n8:00 {Period 0}\n9:00 {Period 1}\n* special # Special Schedule\n10:00 {Period 0}\n11:00 Special Event'
        }

        var result = data[url]
        if (result) { return result } else { throw new Error('Request failed') }
      }
      var cookieManager = new CookieManager()
      var requestManager = new RequestManager(cookieManager, '', {
        get: fakeRequester,
        post: () => {}
      })
      cookieManager.set('source', 'custom')
      cookieManager.set('courses', {'S1KxwpVzM': {'name': 'Slavic R5A', 'sections': [['Monday', [8, 0], [9, 0]]]}})
      cookieManager.set('periods', {
        'Period 0': 'First Period'
      })
      var bellTimer = new BellTimer(cookieManager, requestManager)
      await bellTimer.initialize()
      this.bellTimer = bellTimer
    })

    it('should get custom course correctly', function () {
      this.bellTimer.enableDevMode('2017-12-18 8:00', 0)
      this.bellTimer.getCurrentPeriod().name.should.equal('Slavic R5A')
    })
    it('should set free periods for custom courses', function () {
      this.bellTimer.enableDevMode('2017-12-18 10:00', 0)
      this.bellTimer.getCurrentPeriod().name.should.equal('Free')
    })
  })
  describe('time calculations', function () {
    beforeEach(async function () {
      var fakeRequester = async url => {
        url = url.split('?')[0]

        var data = {
          '/api/sources/names': ['school'],
          '/api/data/school/calendar': '* Default Week\nMon normal\nTue normal\nWed normal\nThu normal\nFri normal\nSat normal\nSun normal\n* Special Days\n10/21/2017 special\n10/22/2017 special # Event Day',
          '/api/data/school/correction': '20000',
          '/api/data/school/schedules': '* normal # Normal Schedule\n8:00 {Period 0}\n9:00 {Period 1}\n* special # Special Schedule\n10:00 {Period 0}\n11:00 Special Event'
        }

        var result = data[url]
        if (result) { return result } else { throw new Error('Request failed') }
      }
      var cookieManager = new CookieManager()
      var requestManager = new RequestManager(cookieManager, '', {
        get: fakeRequester,
        post: () => {}
      })
      cookieManager.set('source', 'school')
      cookieManager.set('periods', {
        'Period 0': 'First Period'
      })
      var bellTimer = new BellTimer(cookieManager, requestManager)
      await bellTimer.initialize()
      this.bellTimer = bellTimer
    })

    it('should calculate time correctly', function () {
      this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0)
      this.bellTimer.getTimeRemainingString().should.equal('29:40')
    })
    it('time remaining string minutes should be padded correctly', function () {
      this.bellTimer.enableDevMode('2017-10-20 8:59:38', 0)
      this.bellTimer.getTimeRemainingString().should.equal('0:02')
    })
    it('time remaining string hours should be padded correctly', function () {
      this.bellTimer.enableDevMode('2017-10-20 5:59:40', 0)
      this.bellTimer.getTimeRemainingString().should.equal('2:00:00')
      this.bellTimer.enableDevMode('2017-10-20 5:58:40', 0)
      this.bellTimer.getTimeRemainingString().should.equal('2:01:00')
    })
    it('should get proportion correct', function () {
      this.bellTimer.enableDevMode('2017-10-20 8:29:40', 0)
      this.bellTimer.getProportionElapsed().should.equal(0.5)
    })
  })
  describe('period selection', function () {
    beforeEach(async function () {
      var fakeRequester = async url => {
        url = url.split('?')[0]

        var data = {
          '/api/sources/names': ['school'],
          '/api/data/school/calendar': '* Default Week\nMon normal\nTue normal\nWed normal\nThu normal\nFri normal\nSat holiday\nSun normal\n* Special Days\n10/18/2017 special\n10/19/2017 holiday\n10/21/2017 special\n10/22/2017 special # Event Day',
          '/api/data/school/correction': '20000',
          '/api/data/school/schedules': '* normal # Normal Schedule\n8:00 {Period 0}\n9:00 {Period 1}\n* special # Special Schedule\n10:00 {Period 0}\n11:00 Special Event\n* holiday # Holiday'
        }

        var result = data[url]
        if (result) { return result } else { throw new Error('Request failed') }
      }
      var cookieManager = new CookieManager()
      var requestManager = new RequestManager(cookieManager, '', {
        get: fakeRequester,
        post: () => {}
      })
      cookieManager.set('source', 'school')
      cookieManager.set('periods', {
        'Period 0': 'First Period'
      })
      var bellTimer = new BellTimer(cookieManager, requestManager)
      await bellTimer.initialize()
      this.bellTimer = bellTimer
    })

    describe('#getPreviousPeriod', function () {
      it('should get correct previous period', function () {
        this.bellTimer.enableDevMode('2017-10-20 9:05', 0)
        this.bellTimer.getPreviousPeriod().name.should.equal('First Period')
      })
      it('should get correct previous period across multiple days', function () {
        this.bellTimer.enableDevMode('2017-10-20 8:05', 0)
        this.bellTimer.getPreviousPeriod().name.should.equal('Special Event')
      })
    })
    describe('#getNextPeriod', function () {
      it('should get correct next period', function () {
        this.bellTimer.enableDevMode('2017-10-20 8:05', 0)
        this.bellTimer.getNextPeriod().name.should.equal('Period 1')
      })
      it('should get correct next period across days', function () {
        this.bellTimer.enableDevMode('2017-10-20 9:05', 0)
        this.bellTimer.getNextPeriod().name.should.equal('First Period')
      })
      it('should get correct next period across multiple days', function () {
        this.bellTimer.enableDevMode('2017-10-13 20:00', 0)
        this.bellTimer.getNextPeriod().name.should.equal('First Period')
      })
    })
    describe('#getFuturePeriods', function () {
      it('should get correct future periods when there are some', function () {
        this.bellTimer.enableDevMode('2017-10-20 7:00', 0)
        this.bellTimer.getFuturePeriods()[0].name.should.equal('First Period')
        this.bellTimer.getFuturePeriods()[1].name.should.equal('Period 1')
        this.bellTimer.getFuturePeriods().length.should.equal(2)
      })
      it('should get correct future periods when day is done (empty)', function () {
        this.bellTimer.enableDevMode('2017-10-20 23:00', 0)
        this.bellTimer.getFuturePeriods().length.should.equal(0)
      })
      it('should get correct future periods when there are none (holiday)', function () {
        this.bellTimer.enableDevMode('2017-10-19 6:00', 0)
        this.bellTimer.getFuturePeriods().length.should.equal(0)
      })
    })
    describe('#getCompletedPeriods', function () {
      it('should get completed periods when there are some', function () {
        this.bellTimer.enableDevMode('2017-10-20 9:05', 0)
        this.bellTimer.getCompletedPeriods()[0].name.should.equal('First Period')
        this.bellTimer.getCompletedPeriods().length.should.equal(1)
      })
      it('should get completed periods when day is beginning (empty)', function () {
        this.bellTimer.enableDevMode('2017-10-20 7:00', 0)
        this.bellTimer.getCompletedPeriods().length.should.equal(0)
      })
      it('should get completed periods when there are none (holiday)', function () {
        this.bellTimer.enableDevMode('2017-10-19 23:00', 0)
        this.bellTimer.getCompletedPeriods().length.should.equal(0)
      })
    })
    describe('#getCurrentPeriod', function () {
      it('should get current period over multiple days', function () {
        this.bellTimer.enableDevMode('2017-10-19 7:00', 0)
        this.bellTimer.getCurrentPeriod().name.should.equal('Special Event')
      })
      it('should give something without dev mode', function () {
        this.bellTimer.disableDevMode()
        this.bellTimer.getCurrentPeriod().name.should.not.equal(null)
      })
    })
  })
})
