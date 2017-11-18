const chai = require('chai');
const should = chai.should();
const expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('ScheduleParser', function() {
    const ScheduleParser = require('../src/ScheduleParser');

    describe('#splitAndPreserve', function() {
        it('splits correctly on with one instance of separator', function() {
            var result = ScheduleParser.splitAndPreserve('* dev / Developer', [' ']);
            result.should.deep.equal(['*', ' ', 'dev', ' ', '/', ' ', 'Developer']);
        });
        it('splits correctly with multiple adjacent separators', function() {
            var result = ScheduleParser.splitAndPreserve('hello    world', [' ']);
            result.should.deep.equal(['hello', ' ', ' ', ' ', ' ', 'world']);
        });
        it('keeps trailing separators', function() {
            var result = ScheduleParser.splitAndPreserve('hello world ', [' ']);
            result.should.deep.equal(['hello', ' ', 'world', ' ']);
        });
        it('works on empty string', function() {
            var result = ScheduleParser.splitAndPreserve('', [' ']);
            result.should.deep.equal([]);
        });
    });

    describe('#lexLine', function() {
        it('lex on schedule header with extra spaces', function() {
            var result = ScheduleParser.lexLine('* dev / Developer');
            result.should.deep.equal(['*', ' ', 'dev', ' ', '/', ' ', 'Developer']);
        });
        it('lex on schedule header without extra spaces', function() {
            var result = ScheduleParser.lexLine('*dev/Developer');
            result.should.deep.equal(['*', 'dev', '/', 'Developer']);
        });
        it('lex on schedule entry', function() {
            var result = ScheduleParser.lexLine('19:10 Hello{0}world');
            result.should.deep.equal(['19:10', ' ', 'Hello', '{', '0', '}', 'world']);
        });
        it('schedule entry preserves spaces', function() {
            var result = ScheduleParser.lexLine('19:10 Hello {0} world');
            result.should.deep.equal(['19:10', ' ', 'Hello', ' ', '{', '0', '}', ' ', 'world']);
        });
    });

    describe('#lex', function() {
        it('should lex a single line properly', function() {
            var result = ScheduleParser.lex('* dev / Developer');
            result.should.deep.equal([
                ['*', ' ', 'dev', ' ', '/', ' ', 'Developer']
            ]);
        });
        it('should lex multiple lines properly', function() {
            var result = ScheduleParser.lex('* dev / Developer\n19:10 Hello {0} world');
            result.should.deep.equal([
                ['*', ' ', 'dev', ' ', '/', ' ', 'Developer'],
                ['19:10', ' ', 'Hello', ' ', '{', '0', '}', ' ', 'world']
            ]);
        });
    });

    describe('#parseLine (header)', function() {
        it('should parse a header', function() {
            var result = ScheduleParser.parseLine('* dev / Developer');
            result.name.should.equal('dev');
            result.display.should.equal('Developer');
        });
        it('should parse a header with extra spaces', function() {
            var result = ScheduleParser.parseLine('*   dev   /     Developer');
            result.name.should.equal('dev');
            result.display.should.equal('Developer');
        });
        it('should ignore leading spaces before *', function() {
            var result = ScheduleParser.parseLine('         *   dev   /     Developer');
            result.name.should.equal('dev');
            result.display.should.equal('Developer');
        });
        it('should parse a header without spaces', function() {
            var result = ScheduleParser.parseLine('*dev/Developer');
            result.name.should.equal('dev');
            result.display.should.equal('Developer');
        });
        it('should parse a header without custom name', function() {
            var result = ScheduleParser.parseLine('* dev');
            result.name.should.equal('dev');
            result.display.should.equal('dev');
        });
        it('should parse a header without custom name with extra spaces', function() {
            var result = ScheduleParser.parseLine('*   dev     ');
            result.name.should.equal('dev');
            result.display.should.equal('dev');
        });
        it('should parse a header without custom name without spaces', function() {
            var result = ScheduleParser.parseLine('*dev');
            result.name.should.equal('dev');
            result.display.should.equal('dev');
        });
        it('should parse a header with spaces in display name', function() {
            var result = ScheduleParser.parseLine('* normal / Normal Schedule');
            result.name.should.equal('normal');
            result.display.should.equal('Normal Schedule');
        });
        it('should parse a header with spaces in display name with trailing spaces', function() {
            var result = ScheduleParser.parseLine('* normal / Normal Schedule    ');
            result.name.should.equal('normal');
            result.display.should.equal('Normal Schedule');
        });
        it('should parse a header with spaces in display name with leading spaces', function() {
            var result = ScheduleParser.parseLine('* normal /    Normal Schedule');
            result.name.should.equal('normal');
            result.display.should.equal('Normal Schedule');
        });
        it('should parse a header with spaces in display name with inner spaces', function() {
            var result = ScheduleParser.parseLine('* normal / Normal  Schedule');
            result.name.should.equal('normal');
            result.display.should.equal('Normal  Schedule');
        });
    });
    describe('#parseLine (entry)', function() {
        it('should parse an entry', function() {
            var result = ScheduleParser.parseLine('8:05 First Period');
            result.time.hour.should.equal(8);
            result.time.min.should.equal(5);
            result.display({}).should.equal('First Period');
        });
        it('should parse an entry with a format word', function() {
            var result = ScheduleParser.parseLine('8:05 {First Period}');
            result.time.hour.should.equal(8);
            result.time.min.should.equal(5);
            result.display({
                'First Period': 'Wind Ensemble'
            }).should.equal('Wind Ensemble');
        });
        it('should parse an entry with a format word with no info', function() {
            var result = ScheduleParser.parseLine('8:05 {First Period}');
            result.time.hour.should.equal(8);
            result.time.min.should.equal(5);
            result.display({}).should.equal('First Period');
        });
        it('should parse an entry with a format word and literal', function() {
            var result = ScheduleParser.parseLine('8:05 Passing to {First Period}');
            result.time.hour.should.equal(8);
            result.time.min.should.equal(5);
            result.display({
                'First Period': 'Wind Ensemble'
            }).should.equal('Passing to Wind Ensemble');
        });
        it('should parse an entry with multiple format words', function() {
            var result = ScheduleParser.parseLine('8:05 {Assembly A} / {Assembly B}');
            result.time.hour.should.equal(8);
            result.time.min.should.equal(5);
            result.display({
                'Assembly A': 'First Class',
                'Assembly B': 'Second Class'
            }).should.equal('First Class / Second Class');
        });
        it('should remove leading whitespace', function() {
            var result = ScheduleParser.parseLine('8:05    Passing to {First Period}');
            result.time.hour.should.equal(8);
            result.time.min.should.equal(5);
            result.display({
                'First Period': 'Wind Ensemble'
            }).should.equal('Passing to Wind Ensemble');
        });
        it('should remove trailing whitespace', function() {
            var result = ScheduleParser.parseLine('8:05 Passing to {First Period}    ');
            result.time.hour.should.equal(8);
            result.time.min.should.equal(5);
            result.display({
                'First Period': 'Wind Ensemble'
            }).should.equal('Passing to Wind Ensemble');
        });
        it('should remove both leading and trailing whitespace', function() {
            var result = ScheduleParser.parseLine('8:05    Passing to {First Period}      ');
            result.time.hour.should.equal(8);
            result.time.min.should.equal(5);
            result.display({
                'First Period': 'Wind Ensemble'
            }).should.equal('Passing to Wind Ensemble');
        });
        it('should remove keep internal spaces', function() {
            var result = ScheduleParser.parseLine('14:30 Passing  to  {First Period}');
            result.time.hour.should.equal(14);
            result.time.min.should.equal(30);
            result.display({
                'First Period': 'Wind Ensemble'
            }).should.equal('Passing  to  Wind Ensemble');
        });
    });

    describe('#parse', function() {
        it('should parse a single entry schedule properly', function() {
            var result = ScheduleParser.parse('* dev / Developer\n8:05 First Period');
            result['dev'].header.name.should.equal('dev');
            result['dev'].entries[0].time.hour.should.equal(8);
            result['dev'].entries[0].time.min.should.equal(5);
            result['dev'].entries[0].display({}).should.equal('First Period');
        });
        it('should parse a two entry schedule properly', function() {
            var result = ScheduleParser.parse('* dev / Developer\n8:05 First Period\n9:00 Second Period');
            result['dev'].header.display.should.equal('Developer');
            result['dev'].entries[0].time.hour.should.equal(8);
            result['dev'].entries[0].time.min.should.equal(5);
            result['dev'].entries[0].display({}).should.equal('First Period');
            result['dev'].entries[1].time.hour.should.equal(9);
            result['dev'].entries[1].time.min.should.equal(0);
            result['dev'].entries[1].display({}).should.equal('Second Period');
        });
        it('should parse a two entry schedule properly with format string', function() {
            var result = ScheduleParser.parse('* dev / Developer\n8:05 {First Period}\n9:00 {Second Period}');
            result['dev'].header.name.should.equal('dev');
            result['dev'].entries[0].time.hour.should.equal(8);
            result['dev'].entries[0].time.min.should.equal(5);
            result['dev'].entries[0].display({
                'First Period': 'Wind Ensemble'
            }).should.equal('Wind Ensemble');
            result['dev'].entries[1].time.hour.should.equal(9);
            result['dev'].entries[1].time.min.should.equal(0);
            result['dev'].entries[1].display({}).should.equal('Second Period');
        });
        it('should ignore extra new lines', function() {
            var result = ScheduleParser.parse('* normal / Normal Schedule\n\n8:05 {First Period}\n\n\n9:00 {Second Period}');
            result['normal'].header.display.should.equal('Normal Schedule');
            result['normal'].entries[0].time.hour.should.equal(8);
            result['normal'].entries[0].time.min.should.equal(5);
            result['normal'].entries[0].display({
                'First Period': 'Wind Ensemble'
            }).should.equal('Wind Ensemble');
            result['normal'].entries[1].time.hour.should.equal(9);
            result['normal'].entries[1].time.min.should.equal(0);
            result['normal'].entries[1].display({}).should.equal('Second Period');
        });
        it('should parse multiple schedules correctly', function() {
            var result = ScheduleParser.parse(
                '* normal / Normal Schedule\n\n8:05 {First Period}\n\n\n9:00 {Second Period}\n\
                 * tutorial / Tutorial Schedule\n8:05 {First Period}\n8:55 Tutorial');
            result['normal'].header.display.should.equal('Normal Schedule');
            result['normal'].entries[0].time.hour.should.equal(8);
            result['normal'].entries[0].time.min.should.equal(5);
            result['normal'].entries[0].display({
                'First Period': 'Wind Ensemble'
            }).should.equal('Wind Ensemble');
            result['normal'].entries[1].time.hour.should.equal(9);
            result['normal'].entries[1].time.min.should.equal(0);
            result['normal'].entries[1].display({}).should.equal('Second Period');

            result['tutorial'].header.display.should.equal('Tutorial Schedule');
            result['tutorial'].entries[0].time.hour.should.equal(8);
            result['tutorial'].entries[0].time.min.should.equal(5);
            result['tutorial'].entries[0].display({
                'First Period': 'Wind Ensemble'
            }).should.equal('Wind Ensemble');
            result['tutorial'].entries[1].time.hour.should.equal(8);
            result['tutorial'].entries[1].time.min.should.equal(55);
            result['tutorial'].entries[1].display({}).should.equal('Tutorial');
        });
        it('should parse a real schedule file correctly', function() {
            var result = ScheduleParser.parse(
                '* normal / Normal Schedule\n\
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
                * tutorial / Tutorial Schedule\n\
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
                15:30 After School\n');
            result['normal'].header.display.should.equal('Normal Schedule');
            result['normal'].entries[7].display({}).should.equal('Passing to Period 3');
            result['tutorial'].header.display.should.equal('Tutorial Schedule');
            result['tutorial'].entries[9].time.min.should.equal(50);
            result['tutorial'].entries[9].display({
                extra: 'should ignore'
            }).should.equal('Passing to tutorial');
        });
    });
});