/* global describe, it */

const chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe('ScheduleParser', function () {
  const parse = require('../src/ScheduleParser').default

  describe('#parse', function () {
    it('should parse a single entry schedule names properly', function () {
      var result = parse('* dev # Developer\n8:05 First Period')

      result['dev'].name.should.equal('dev')
      result['dev'].display.should.equal('Developer')
    })
    it('should parse a single entry schedule names with multiword display name', function () {
      var result = parse('* dev # Multi Word\n8:05 First Period')

      result['dev'].name.should.equal('dev')
      result['dev'].display.should.equal('Multi Word')
    })
    it('should parse a single entry schedule names with no display name', function () {
      var result = parse('* dev\n8:05 First Period')

      result['dev'].name.should.equal('dev')
      result['dev'].display.should.equal('dev')
    })
    it('should parse no periods', function () {
      var result = parse('* holiday # Holiday\n')

      result['holiday'].name.should.equal('holiday')
      result['holiday'].display.should.equal('Holiday')
      result['holiday'].periods.length.should.equal(0)
    })
    it('should parse one period', function () {
      var result = parse('* normal # Normal Schedule\n8:05 First Period')

      result['normal'].name.should.equal('normal')
      result['normal'].display.should.equal('Normal Schedule')
      result['normal'].periods[0].time.should.deep.equal({
        hour: 8,
        min: 5
      })
      result['normal'].periods[0].display({}).should.equal('First Period')
    })
    it('should parse one period with format', function () {
      var result = parse('* normal # Normal Schedule\n8:05 {Period 1}')

      result['normal'].name.should.equal('normal')
      result['normal'].display.should.equal('Normal Schedule')
      result['normal'].periods[0].time.should.deep.equal({
        hour: 8,
        min: 5
      })
      result['normal'].periods[0].display({
        'Period 1': 'Wind Ensemble'
      }).should.equal('Wind Ensemble')
    })
    it('should parse one period with format with literals', function () {
      var result = parse('* normal # Normal Schedule\n8:05 Passing to {Period 1}')

      result['normal'].name.should.equal('normal')
      result['normal'].display.should.equal('Normal Schedule')
      result['normal'].periods[0].time.should.deep.equal({
        hour: 8,
        min: 5
      })
      result['normal'].periods[0].display({
        'Period 1': 'Wind Ensemble'
      }).should.equal('Passing to Wind Ensemble')
    })
    it('should parse one period with extra spaces', function () {
      var result = parse('*    normal   #   Normal Schedule      \n8:05    First Period  ')

      result['normal'].name.should.equal('normal')
      result['normal'].display.should.equal('Normal Schedule')
      result['normal'].periods[0].time.should.deep.equal({
        hour: 8,
        min: 5
      })
      result['normal'].periods[0].display({}).should.equal('First Period')
    })
    it('should parse one period with no bindings', function () {
      var result = parse('* normal # Normal Schedule\n8:05 {Period 0}')

      result['normal'].name.should.equal('normal')
      result['normal'].display.should.equal('Normal Schedule')
      result['normal'].periods[0].time.should.deep.equal({
        hour: 8,
        min: 5
      })
      result['normal'].periods[0].display().should.equal('Period 0')
    })

    it('should parse a real schedule file correctly', function () {
      var result = parse(
        `* normal # Normal Schedule\n\
                7:10 Passing to {Period 0}\n\
                7:15 {Period 0}\n\
                8:05 Passing to {Period 1}\n\
                8:10 {Period 1}\n\
                9:00 Passing to {Period 2}\n\
                9:05 {Period 2}\n\
                10:00 Brunch\n\
                10:10 Passing to {Period 3}\n\
                10:15 {Period 3}\n\
                11:05 Passing to {Period 4}\n\
                11:10 {Period 4}\n\
                12:00 Lunch\n\
                12:45 Passing to {Period 5}\n\
                12:50 {Period 5}\n\
                13:40 Passing to {Period 6}\n\
                13:45 {Period 6}\n\
                14:35 Passing to {Period 7}\n\
                14:40 {Period 7}\n\
                15:30 After School\n\
                * tutorial # Tutorial Schedule\n\
                7:15 Passing to {Period 0}\n\
                7:20 {Period 0}\n\
                8:05 Passing to {Period 1}\n\
                8:10 {Period 1}\n\
                8:55 Passing to {Period 2}\n\
                9:00 {Period 2}\n\
                9:50 Brunch\n\
                10:00 Passing to {Period 3}\n\
                10:05 {Period 3}\n\
                10:50 Passing to tutorial\n\
                10:55 Tutorial\n\
                11:25 Passing to {Period 4}\n\
                11:30 {Period 4}\n\
                12:15 Lunch\n\
                13:00 Passing to {Period 5}\n\
                13:05 {Period 5}\n\
                13:50 Passing to {Period 6}\n\
                13:55 {Period 6}\n\
                14:40 Passing to {Period 7}\n\
                14:45 {Period 7}\n\
                15:30 After School\n`)
      result['normal'].name.should.equal('normal')
      result['normal'].display.should.equal('Normal Schedule')
      result['tutorial'].name.should.equal('tutorial')
      result['tutorial'].display.should.equal('Tutorial Schedule')

      // result['normal'].getCurrentPeriod(new Date('2017-11-20 8:10')).display().should.equal('Period 1');
      // result['tutorial'].getCurrentPeriod(new Date('2017-11-20 11:00')).display().should.equal('Tutorial');
      // result['tutorial'].getCurrentPeriod(new Date('2017-11-20 11:25')).display({
      //     'Period 4': 'Film Analysis'
      // }).should.equal('Passing to Film Analysis');
      // result['tutorial'].getPreviousPeriod(new Date('2017-11-20 11:25')).display({
      //     'Period 4': 'Film Analysis'
      // }).should.equal('Tutorial');
      // result['tutorial'].getNextPeriod(new Date('2017-11-20 11:25')).display({
      //     'Period 4': 'Film Analysis'
      // }).should.equal('Film Analysis');
      // result['tutorial'].getCurrentPeriod(new Date('2017-11-20 22:25')).display({
      //     'Period 4': 'Film Analysis'
      // }).should.equal('After School');
    })
  })
})
