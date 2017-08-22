module.exports = {
  entry: {
    app: ['./js/client.js', './js/stats.js']
  },
  output: {
    path: __dirname + '/bin/',
    filename: '[name].js'
  }
};