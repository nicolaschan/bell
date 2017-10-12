const webpack = require('webpack');

module.exports = {
  entry: {
    client: ['./js/client.js'],
    stats: ['./js/stats.js'],
    enter: ['./js/enter.js'],
    classes: ['./js/classes.js'],
    settings: ['./js/settings.js']
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
  },
  module: {
    rules: [{
      test: /\.coffee$/,
      use: ['coffee-loader']
    }]
  }
};