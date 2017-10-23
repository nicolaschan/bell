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
                    '/api/data/school/calendar': '* Default Week\n0 normal\n1 normal\n2 normal\n3 normal\n4 normal\n5 normal\n6 normal',
                    '/api/data/school/correction': '1000',
                    '/api/data/school/schedules': '* normal (Normal Schedule)\n8:00 {Period 0}\n9:00 {Period 1}'
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
            cookieManager.set('dev_mode', {
                startDate: '2017-10-20 8:30:00',
                scale: 0
            });
            var bellTimer = new BellTimer(cookieManager, requestManager);
            await bellTimer.initialize();
            this.bellTimer = bellTimer;
        });

        it('schedules should be set correctly', function() {
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
                }
            });
        });
        it('custom period names should replace default', function() {
            this.bellTimer.schedules.normal.periods[1].name.should.equal('First Period');
        });
        it('default period name is in curly braces', function() {
            this.bellTimer.schedules.normal.periods[0].name.should.equal('Period 0');
        });
        it('calendar should be set correctly', function() {
            this.bellTimer.calendar.should.deep.equal({
                defaultWeek: ['normal', 'normal', 'normal', 'normal', 'normal', 'normal', 'normal'],
                specialDays: {}
            });
        });
        it('current schedule should be correct', function() {
            this.bellTimer.getCurrentSchedule().displayName.should.equal('Normal Schedule');
        });
        it('previous period is correct', function() {
            this.bellTimer.getPreviousPeriod().name.should.equal('First Period');
        });
    });

    describe('#loadCustomCourses', function() {});
});