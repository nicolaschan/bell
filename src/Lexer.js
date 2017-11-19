const separators = ['*', ' ', '{', '}', '#'];

var splitAndPreserve = function(str, chars) {
    var pieces = [''];
    for (let c of str) {
        if (chars.indexOf(c) > -1) {
            pieces.push(c);
            pieces.push('');
        } else {
            pieces[pieces.length - 1] += c;
        }
    }
    return pieces.filter(str => str.length > 0);
};

var lex = function(line) {
    return splitAndPreserve(line, separators);
};

var drop = function(char, arr) {
    while (arr[0] == char)
        arr = arr.slice(1);
    return arr;
};

var dropEnd = function(char, arr) {
    while (arr[arr.length - 1] == char)
        arr = arr.slice(0, -1);
    return arr;
};

var trim = function(char, arr) {
    return drop(char, dropEnd(char, arr));
};

var concat = function(arr) {
    return arr.reduce((a, b) => a.concat(b), '');
};

module.exports = {
    lex: lex,
    drop: drop,
    dropEnd: dropEnd,
    trim: trim,
    splitAndPreserve: splitAndPreserve,
    concat: concat
};