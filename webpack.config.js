module.exports = {
  entry: {
    client: ['./js/client.js'],
    stats: ['./js/stats.js']
  },
  output: {
    path: __dirname + '/bin/',
    filename: '[name].js'
  }
};