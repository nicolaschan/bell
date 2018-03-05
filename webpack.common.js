require('webpack')
const path = require('path')

module.exports = {
  entry: {
    stats: ['babel-polyfill', './src/stats.js'],
    online: ['babel-polyfill', './src/online.js'],
    'client-mithril': ['babel-polyfill', './src/client-mithril.js'],
    'service-worker': ['babel-polyfill', './src/service-worker.js']
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
  output: {
    path: path.join(__dirname, 'bin'),
    filename: '[name].js'
  }
}
