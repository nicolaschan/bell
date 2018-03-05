require('webpack')

const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    popup: ['./src/popup.js'],
    contentScript: ['./src/contentScript.js'],
    background: ['./src/background.js']
  },
  resolve: {
    alias: {}
  },
  output: {
    path: path.join(__dirname, 'bin'),
    filename: '[name].js'
  }
}
