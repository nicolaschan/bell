const separators = ['*', ' ', '{', '}', '#']

function splitAndPreserve (str, chars) {
  var pieces = ['']
  for (let c of str) {
    if (chars.indexOf(c) > -1) {
      pieces.push(c)
      pieces.push('')
    } else {
      pieces[pieces.length - 1] += c
    }
  }
  return pieces.filter(str => str.length > 0)
}

function lex (line) {
  return splitAndPreserve(line, separators)
}

function drop (char, arr) {
  while (arr[0] === char) { arr = arr.slice(1) }
  return arr
}

function dropEnd (char, arr) {
  while (arr[arr.length - 1] === char) { arr = arr.slice(0, -1) }
  return arr
}

function trim (char, arr) {
  return drop(char, dropEnd(char, arr))
}

function concat (arr) {
  return arr.reduce((a, b) => a.concat(b), '')
}

function remove (char, str) {
  return concat(str.split(char))
}

module.exports = { splitAndPreserve, lex, drop, dropEnd, trim, concat, remove }
