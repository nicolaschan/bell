/* global describe, it */

const chai = require('chai')
chai.should()
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe('CalendarParser', function () {
  const parse = require('../src/CalendarParser')
  const scheduleParse = require('../src/ScheduleParser')

  describe('#parse', function () {
    it('should parse a single entry schedule names properly', function () {
      var result = parse(`* Default Week
                Mon normal
                Tue tutorial
                Wed even
                Thu odd
                Fri normal
                Sat weekend
                Sun weekend`, {})
      result.week.should.deep.equal({
        Mon: {
          name: 'normal'
        },
        Tue: {
          name: 'tutorial'
        },
        Wed: {
          name: 'even'
        },
        Thu: {
          name: 'odd'
        },
        Fri: {
          name: 'normal'
        },
        Sat: {
          name: 'weekend'
        },
        Sun: {
          name: 'weekend'
        }
      })
      result.special.should.deep.equal({})
    })
    it('should parse a single entry schedule names with overrides properly', function () {
      var result = parse(`* Default Week
                Mon normal
                Tue tutorial
                Wed even
                Thu odd
                Fri normal # Friday
                Sat weekend
                Sun weekend`, {})
      result.week.should.deep.equal({
        Mon: {
          name: 'normal'
        },
        Tue: {
          name: 'tutorial'
        },
        Wed: {
          name: 'even'
        },
        Thu: {
          name: 'odd'
        },
        Fri: {
          name: 'normal',
          display: 'Friday'
        },
        Sat: {
          name: 'weekend'
        },
        Sun: {
          name: 'weekend'
        }
      })
    })
    it('should parse a single entry schedule names properly with extra spaces', function () {
      var result = parse(`* Default Week\n\
                Mon   normal\n\
                Tue tutorial  \n\
                Wed  even\n\
                  Thu odd  #Thursday\n\
                Fri normal#     Friday\n\
                Sat weekend    \n\n\
                Sun weekend`, {})
      result.week.should.deep.equal({
        Mon: {
          name: 'normal'
        },
        Tue: {
          name: 'tutorial'
        },
        Wed: {
          name: 'even'
        },
        Thu: {
          name: 'odd',
          display: 'Thursday'
        },
        Fri: {
          name: 'normal',
          display: 'Friday'
        },
        Sat: {
          name: 'weekend'
        },
        Sun: {
          name: 'weekend'
        }
      })
    })

    it('should parse special days properly', function () {
      var result = parse(`* Default Week\n\
                Mon normal\n\
                Tue tutorial\n\
                Wed even\n\
                Thu odd\n\
                Fri normal\n\
                Sat weekend\n\
                Sun weekend\n\
                \n\
                * Special Days\n\
                11/22/2017 holiday\n\
                11/23/2017 holiday # Thanksgiving\n\
                12/30/2017-01/01/2018 holiday`, {})
      result.week.should.deep.equal({
        Mon: {
          name: 'normal'
        },
        Tue: {
          name: 'tutorial'
        },
        Wed: {
          name: 'even'
        },
        Thu: {
          name: 'odd'
        },
        Fri: {
          name: 'normal'
        },
        Sat: {
          name: 'weekend'
        },
        Sun: {
          name: 'weekend'
        }
      })
      result.special.should.deep.equal({
        '11/22/2017': {
          name: 'holiday'
        },
        '11/23/2017': {
          name: 'holiday',
          display: 'Thanksgiving'
        },
        '12/30/2017': {
          name: 'holiday'
        },
        '12/31/2017': {
          name: 'holiday'
        },
        '01/01/2018': {
          name: 'holiday'
        }
      })
    })
    it('should retrieve default week schedules properly', function () {
      var schedules = scheduleParse('* normal # Normal Schedule\n8:05 {Period 0}')

      var result = parse(`* Default Week\n\
                Mon normal\n\
                Tue tutorial\n\
                Wed even\n\
                Thu odd\n\
                Fri normal\n\
                Sat weekend\n\
                Sun weekend`, schedules)
      result.getSchedule(new Date('11/20/2017')).name.should.equal('normal')
      result.getSchedule(new Date('11/20/2017')).display.should.equal('Normal Schedule')
    })
    it('should retrieve default week schedules with overrides properly', function () {
      var schedules = scheduleParse('* normal # Normal Schedule\n8:05 {Period 0}')

      var result = parse(`* Default Week\n\
                Mon normal # Monday!\n\
                Tue tutorial\n\
                Wed even\n\
                Thu odd\n\
                Fri normal\n\
                Sat weekend\n\
                Sun weekend`, schedules)
      result.getSchedule(new Date('11/20/2017')).name.should.equal('normal')
      result.getSchedule(new Date('11/20/2017')).display.should.equal('Monday!')
      result.getSchedule(new Date('11/24/2017')).display.should.equal('Normal Schedule')
    })
    it('should retrieve special schedules properly', function () {
      var schedules = scheduleParse('* normal # Normal Schedule\n8:05 {Period 0}\n* holiday')
      var result = parse(
        `* Default Week
        Mon normal
        Tue normal
        Wed normal
        Thu normal
        Fri normal
        Sat normal
        Sun normal

        * Special Days
        12/27/2017 holiday`, schedules)
      result.getSchedule(new Date('12/27/2017')).name.should.equal('holiday')
    })
  })
})
