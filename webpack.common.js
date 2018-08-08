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
      test: /\.(js|ts)x?$/,
      use: 'babel-loader',
      exclude: /node_modules/
    }, {
      test: /\.tsx?$/,
      use: {
        loader: 'ts-loader'
      },
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    path: path.join(__dirname, 'bin'),
    filename: '[name].js'
  }
}
