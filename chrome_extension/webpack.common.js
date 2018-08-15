require('webpack')

const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    popup: ['babel-polyfill', './src/popup.js'],
    contentScript: ['babel-polyfill', './src/contentScript.js'],
    background: ['babel-polyfill', './src/background.js']
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
