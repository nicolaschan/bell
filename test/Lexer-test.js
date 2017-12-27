/* global describe, it */

const chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
describe('Lexer', function () {
  const {
        lex,
        splitAndPreserve
    } = require('../src/Lexer')
  describe('#lexLine', function () {
    it('lex on schedule header with extra spaces', function () {
      var result = lex('* dev # Developer')
      result.should.deep.equal(['*', ' ', 'dev', ' ', '#', ' ', 'Developer'])
    })
    it('lex on schedule header without extra spaces', function () {
      var result = lex('*dev#Developer')
      result.should.deep.equal(['*', 'dev', '#', 'Developer'])
    })
  })
  describe('#splitAndPreserve', function () {
    it('splits correctly on with one instance of separator', function () {
      var result = splitAndPreserve('* dev # Developer', [' '])
      result.should.deep.equal(['*', ' ', 'dev', ' ', '#', ' ', 'Developer'])
    })
    it('splits correctly with multiple adjacent separators', function () {
      var result = splitAndPreserve('hello    world', [' '])
      result.should.deep.equal(['hello', ' ', ' ', ' ', ' ', 'world'])
    })
    it('keeps trailing separators', function () {
      var result = splitAndPreserve('hello world ', [' '])
      result.should.deep.equal(['hello', ' ', 'world', ' '])
    })
    it('works on empty string', function () {
      var result = splitAndPreserve('', [' '])
      result.should.deep.equal([])
    })
  })
})
