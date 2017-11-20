const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('BellTimer', function() {
    const BellTimer = require('../src/BellTimer');
    const CookieManager = require('../src/CookieManager2');
    const RequestManager = require('../src/RequestManager');

    describe('#constructor', function() {
        it('test cookie manager is set', function() {
            var cookieManager = new CookieManager();
            var requestManager = new RequestManager(cookieManager);
            var bellTimer = new BellTimer(cookieManager, requestManager);
            bellTimer.cookieManager.should.equal(cookieManager);
        });
        it('test request manager is set', function() {
            var cookieManager = new CookieManager();
            var requestManager = new RequestManager(cookieManager);
            var bellTimer = new BellTimer(cookieManager, requestManager);
            bellTimer.requestManager.should.equal(requestManager);
        });
        it('set dev mode with dev_mode cookie', function() {
            var cookieManager = new CookieManager();
            cookieManager.set('dev_mode', {
                startDate: '2017-10-20',
                scale: 2
            });
            var requestManager = new RequestManager(cookieManager);
            var bellTimer = new BellTimer(cookieManager, requestManager);
            bellTimer.devMode.should.be.true;
            bellTimer.timeScale.should.equal(2);
        });
    });

    describe('#initialize', function() {
        beforeEach(async function() {
            var fakeRequester = async url => {
                url = url.split('?')[0];

                var data = {
                    '/api/data/school/calendar': '* Default Week\nMon normal\nTue normal\nWed normal\nThu normal\nFri normal\nSat normal\nSun normal\n* Special Days\n10/21/2017 special\n10/22/2017 special # Event Day',
                    '/api/data/school/correction': '20000',
                    '/api/data/school/schedules': '* normal # Normal Schedule\n8:00 {Period 0}\n9:00 {Period 1}\n* special # Special Schedule\n10:00 {Period 0}\n11:00 Special Event'
                };

                var result = data[url];
                if (result)
                    return result;
                else
                    throw new Error('Request failed');
            };
            var cookieManager = new CookieManager();
            var requestManager = new RequestManager(cookieManager, '', {
                get: fakeRequester,
                post: () => {}
            });
            cookieManager.set('source', 'school');
            cookieManager.set('periods', {
                'Period 1': 'First Period'
            });
            var bellTimer = new BellTimer(cookieManager, requestManager);
            await bellTimer.initialize();
            this.bellTimer = bellTimer;
        });

        it('should retrieve normal schedule correctly', function() {
            this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0);
            this.bellTimer.getCurrentSchedule().name.should.equal('normal');
            this.bellTimer.getCurrentSchedule().display.should.equal('Normal Schedule');
        });
        it('should retrieve special schedules correctly', function() {
            this.bellTimer.enableDevMode('2017-10-21 8:30:00', 0);
            this.bellTimer.getCurrentSchedule().name.should.equal('special');
            this.bellTimer.getCurrentSchedule().display.should.equal('Special Schedule');
        });
        it('custom period names should replace default', function() {
            this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0);
            this.bellTimer.getCurrentPeriod().display({
                'Period 0': 'First Period'
            }).should.equal('First Period');
        });
        it('default period name is in curly braces', function() {
            this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0);
            this.bellTimer.getCurrentPeriod().display().should.equal('Period 0');
        });
        it('calendar should be set correctly', function() {
            this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0);
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
            });
            this.bellTimer.calendar.special.should.deep.equal({
                '10/21/2017': {
                    name: 'special'
                },
                '10/22/2017': {
                    name: 'special',
                    display: 'Event Day'
                }
            });
        });
        // it('current schedule should be correct', function() {
        //     this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0);
        //     this.bellTimer.getCurrentSchedule().display().should.equal('Normal Schedule');
        // });
        // it('previous period is correct if previous is yesterday', function() {
        //     this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0);
        //     this.bellTimer.getPreviousPeriod().display().should.equal('First Period');
        // });
        // it('previous period is correct if previous is today', function() {
        //     this.bellTimer.enableDevMode('2017-10-20 9:30:00', 0);
        //     this.bellTimer.getPreviousPeriod().display().should.equal('Period 0');
        // });
        // it('future period is correct', function() {
        //     this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0);
        //     this.bellTimer.getFuturePeriods().should.have.length(1);
        //     this.bellTimer.getFuturePeriods()[0].name.should.equal('First Period');
        // });
        // it('completed periods is correct', function() {
        //     this.bellTimer.enableDevMode('2017-10-20 9:30:00', 0);
        //     this.bellTimer.getCompletedPeriods()[0].name.should.equal('Period 0');
        // });
        // it('special schedule is selected when date matches', function() {
        //     this.bellTimer.enableDevMode('2017-10-21 8:30:00', 0);
        //     this.bellTimer.getCurrentSchedule().displayName.should.equal('Special Schedule');
        // });
        // it('special schedule with custom name is selected when date matches', function() {
        //     this.bellTimer.enableDevMode('2017-10-22 8:30:00', 0);
        //     this.bellTimer.getCurrentSchedule().displayName.should.equal('Event Day');
        // });
        // it('correction is set correctly', function() {
        //     this.bellTimer.correction.should.equal(20000);
        // });
        // it('correction is applied correctly', function() {
        //     this.bellTimer.enableDevMode('2017-10-20 8:59:50', 0);
        //     this.bellTimer.getCurrentPeriod().name.should.equal('First Period');
        // });
    });
});