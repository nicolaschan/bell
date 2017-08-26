const webpack = require('webpack');

module.exports = {
  entry: {
    client: ['./js/client.js'],
    stats: ['./js/stats.js'],
    enter: ['./js/enter.js']
  },
  resolve: {
    alias: {}
  },
  plugins: [new webpack.ProvidePlugin({
    // 'window.jQuery': 'jquery'
  })],
  output: {
    path: __dirname + '/bin/',
    filename: '[name].js'
  }
};