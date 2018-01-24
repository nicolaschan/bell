require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')

module.exports = {
  entry: {
    stats: ['babel-polyfill', './src/stats.js'],
    enter: ['babel-polyfill', './src/enter.js'],
    classes: ['babel-polyfill', './src/classes.js'],
    settings: ['babel-polyfill', './src/settings.coffee'],
    periods: ['babel-polyfill', './src/periods.coffee'],
    online: ['babel-polyfill', './src/online.js'],
    'client-mithril': ['babel-polyfill', './src/client-mithril.js'],
    'service-worker': ['babel-polyfill', './src/service-worker.js']
  },
  resolve: {
    alias: {}
  },
  output: {
    path: path.join(__dirname, 'bin'),
    filename: '[name].js'
  },
  module: {
    rules: [{
      test: /\.coffee$/,
      use: ['coffee-loader']
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
  plugins: [new UglifyJsPlugin({
    cache: true
  })]
}