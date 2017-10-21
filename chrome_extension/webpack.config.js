const webpack = require('webpack');

module.exports = {
    entry: {
        popup: ['./src/popup.js'],
        contentScript: ['./src/contentScript.js'],
        background: ['./src/background.js']
    },
    resolve: {
        alias: {}
    },
    output: {
        path: __dirname + '/bin/',
        filename: '[name].js'
    }
};