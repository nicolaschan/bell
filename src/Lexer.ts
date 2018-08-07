const separators: string[] = ['*', ' ', '{', '}', '#']

function splitAndPreserve (str: string, chars: string[]): string[] {
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

function lex (line: string): string[] {
  return splitAndPreserve(line, separators)
}

function drop (char: string, arr: string[]): string[] {
  while (arr[0] === char) { arr = arr.slice(1) }
  return arr
}

function dropEnd (char: string, arr: string[]): string[] {
  while (arr[arr.length - 1] === char) { arr = arr.slice(0, -1) }
  return arr
}

function trim (char: string, arr: string[]): string[] {
  return drop(char, dropEnd(char, arr))
}

function concat (arr: string[]): string {
  return arr.reduce((a, b) => a.concat(b), '')
}

function remove (char: string, str: string): string {
  return concat(str.split(char))
}

export { splitAndPreserve, lex, drop, dropEnd, trim, concat, remove }
