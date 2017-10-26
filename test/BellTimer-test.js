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
                    '/api/data/school/calendar': '* Default Week\n0 normal\n1 normal\n2 normal\n3 normal\n4 normal\n5 normal\n6 normal\n* Special Days\n10/21/2017 special\n10/22/2017 special (Event Day)',
                    '/api/data/school/correction': '20000',
                    '/api/data/school/schedules': '* normal (Normal Schedule)\n8:00 {Period 0}\n9:00 {Period 1}\n* special (Special Schedule)\n10:00 {Period 0}\n11:00 Special Event'
                };

                var result = data[url];
                if (result)
                    return result;
                else
                    throw new Error('Request failed');
            };
            var cookieManager = new CookieManager();
            var requestManager = new RequestManager(cookieManager, '', fakeRequester);
            cookieManager.set('source', 'school');
            cookieManager.set('periods', {
                'Period 1': 'First Period'
            });
            var bellTimer = new BellTimer(cookieManager, requestManager);
            await bellTimer.initialize();
            this.bellTimer = bellTimer;
        });

        it('schedules should be set correctly', function() {
            this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0);
            this.bellTimer.schedules.should.deep.equal({
                normal: {
                    displayName: 'Normal Schedule',
                    periods: [{
                        name: 'Period 0',
                        time: [8, 0]
                    }, {
                        name: 'First Period',
                        time: [9, 0]
                    }]
                },
                special: {
                    displayName: 'Special Schedule',
                    periods: [{
                        name: 'Period 0',
                        time: [10, 0]
                    }, {
                        name: 'Special Event',
                        time: [11, 0]
                    }]
                }
            });
        });
        it('custom period names should replace default', function() {
            this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0);
            this.bellTimer.schedules.normal.periods[1].name.should.equal('First Period');
        });
        it('default period name is in curly braces', function() {
            this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0);
            this.bellTimer.schedules.normal.periods[0].name.should.equal('Period 0');
        });
        it('calendar should be set correctly', function() {
            this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0);
            this.bellTimer.calendar.should.deep.equal({
                defaultWeek: ['normal', 'normal', 'normal', 'normal', 'normal', 'normal', 'normal'],
                specialDays: {
                    '2017-10-21': {
                        scheduleName: 'special',
                        customName: 'Special Schedule'
                    },
                    '2017-10-22': {
                        scheduleName: 'special',
                        customName: 'Event Day'
                    }
                }
            });
        });
        it('current schedule should be correct', function() {
            this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0);
            this.bellTimer.getCurrentSchedule().displayName.should.equal('Normal Schedule');
        });
        it('previous period is correct if previous is yesterday', function() {
            this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0);
            this.bellTimer.getPreviousPeriod().name.should.equal('First Period');
        });
        it('previous period is correct if previous is today', function() {
            this.bellTimer.enableDevMode('2017-10-20 9:30:00', 0);
            this.bellTimer.getPreviousPeriod().name.should.equal('Period 0');
        });
        it('future period is correct', function() {
            this.bellTimer.enableDevMode('2017-10-20 8:30:00', 0);
            this.bellTimer.getFuturePeriods().should.have.length(1);
            this.bellTimer.getFuturePeriods()[0].name.should.equal('First Period');
        });
        it('completed periods is correct', function() {
            this.bellTimer.enableDevMode('2017-10-20 9:30:00', 0);
            this.bellTimer.getCompletedPeriods()[0].name.should.equal('Period 0');
        });
        it('special schedule is selected when date matches', function() {
            this.bellTimer.enableDevMode('2017-10-21 8:30:00', 0);
            this.bellTimer.getCurrentSchedule().displayName.should.equal('Special Schedule');
        });
        it('special schedule with custom name is selected when date matches', function() {
            this.bellTimer.enableDevMode('2017-10-22 8:30:00', 0);
            this.bellTimer.getCurrentSchedule().displayName.should.equal('Event Day');
        });
        it('correction is set correctly', function() {
            this.bellTimer.correction.should.equal(20000);
        });
        it('correction is applied correctly', function() {
            this.bellTimer.enableDevMode('2017-10-20 8:59:50', 0);
            this.bellTimer.getCurrentPeriod().name.should.equal('First Period');
        });
    });

    describe('#loadCustomCourses', function() {});
});