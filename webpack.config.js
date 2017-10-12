const webpack = require('webpack');

module.exports = {
  entry: {
    client: ['./src/client.js'],
    stats: ['./src/stats.js'],
    enter: ['./src/enter.js'],
    classes: ['./src/classes.js'],
    settings: ['./src/settings.coffee']
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