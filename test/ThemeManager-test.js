/* global describe, it, beforeEach */

const chai = require('chai')
chai.should()
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe('ThemeManager', function () {
  const ThemeManager = require('../src/ThemeManager')
  const BellTimer = require('../src/BellTimer')
  const RequestManager = require('../src/RequestManager')
  const CookieManager = require('../src/CookieManager3')

  beforeEach(async function () {
    var cookieManager = new CookieManager()
    await cookieManager.initialize()
    var themeManager = new ThemeManager(cookieManager)
    var requestManager = new RequestManager(cookieManager, '', {
      get: async url => {
        url = url.split('?')[0]

        var data = {
          '/api/sources/names': ['school'],
          '/api/data/school/calendar': '* Default Week\nMon normal\nTue normal\nWed normal\nThu normal\nFri normal\nSat weekend\nSun holiday\n',
          '/api/data/school/correction': '0',
          '/api/data/school/schedules': '* normal # Normal Schedule\n8:00 {Period 0}\n9:00 Free\n* weekend\n* holiday'
        }

        var result = data[url]
        if (result) { return result } else { throw new Error('Request failed') }
      },
      post: () => {}
    })
    var bellTimer = new BellTimer(cookieManager, requestManager)
    cookieManager.clear()
    cookieManager.set('source', 'school')
    this.cookieManager = cookieManager
    this.themeManager = themeManager
    this.bellTimer = bellTimer
    return bellTimer.initialize()
  })

  describe('ColorSchemeTransformations', function () {
    describe('#fromObjectStrings', function () {
      it('should ignore non-string keys', function () {
        const ColorSchemeTransformations = require('../src/themes/ColorSchemeTransformations')
        var styles = {
          background: {'text-decoration': 'none'},
          text: {'text-decoration': 'none'},
          subtext: {'text-decoration': 'none'},
          contrast: {'text-decoration': 'none'}
        }
        ColorSchemeTransformations.fromObjectStrings(styles).should.deep.equal(styles)
      })
    })
  })

  describe('#currentTheme', function () {
    it('Theme should be set according to theme name', function () {
      this.themeManager.currentThemeName = 'Default - Light'
      this.themeManager.currentTheme.name.should.equal('Default - Light')
    })
    it('If current theme name is not a theme, use default', function () {
      this.themeManager.currentThemeName = 'Not a theme'
      this.themeManager.currentTheme.name.should.equal('Default - Light')
      this.themeManager.currentThemeName.should.equal('Default - Light')
    })
  })

  describe('#availableThemes', function () {
    it('should filter correctly if secret is not present', function () {
      this.cookieManager.remove('secrets')
      Object.keys(this.themeManager.availableThemes).should.not.contain('Secret: Jonathan')
    })
    it('should include secrets', function () {
      this.cookieManager.set('secrets', ['jonathan'])
      Object.keys(this.themeManager.availableThemes).should.contain('Secret: Jonathan')
    })
  })
  describe('Themes', function () {
    describe('Default - Light', function () {
      beforeEach(function () {
        this.themeManager.currentThemeName = 'Default - Light'
      })
      it('Verify colors on normal day when greater than 15 min', function () {
        this.bellTimer.enableDevMode('2017-12-25 6:00', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('lime')
      })
      it('Verify colors on normal day when time = 14:59 min', function () {
        this.bellTimer.enableDevMode('2017-12-25 7:45:01', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('yellow')
      })
      it('Verify colors on normal day when time = 4:59 min', function () {
        this.bellTimer.enableDevMode('2017-12-25 7:55:01', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('orange')
      })
      it('Verify colors on normal day when time = 1:59 min', function () {
        this.bellTimer.enableDevMode('2017-12-25 7:58:01', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('red')
      })
      it('Verify colors on holiday', function () {
        this.bellTimer.enableDevMode('2017-12-24 7:00', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('magenta')
      })
      it('Verify colors on weekend', function () {
        this.bellTimer.enableDevMode('2017-12-23 7:00', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('cyan')
      })
    })
    describe('Rainbow - Light', function () {
      beforeEach(function () {
        this.themeManager.currentThemeName = 'Rainbow - Light'
      })
      it('Color cycle is 2 seconds', function () {
        this.bellTimer.enableDevMode('2017-12-25 7:00:00', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.not.equal('red')
        this.bellTimer.enableDevMode('2017-12-25 7:00:01', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('red')
        this.bellTimer.enableDevMode('2017-12-25 7:00:02', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('red')
        this.bellTimer.enableDevMode('2017-12-25 7:00:03', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.not.equal('red')
      })
      it('All colors appear in correct order', function () {
        this.bellTimer.enableDevMode('2017-12-25 7:00:01', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('red')
        this.bellTimer.enableDevMode('2017-12-25 7:00:03', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('orange')
        this.bellTimer.enableDevMode('2017-12-25 7:00:05', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('yellow')
        this.bellTimer.enableDevMode('2017-12-25 7:00:07', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('lime')
        this.bellTimer.enableDevMode('2017-12-25 7:00:09', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('cyan')
        this.bellTimer.enableDevMode('2017-12-25 7:00:11', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('magenta')
        this.bellTimer.enableDevMode('2017-12-25 7:00:13', 0)
        this.themeManager.currentTheme.theme(this.bellTimer).background['background-color'].should.equal('red')
      })
    })
  })
})
