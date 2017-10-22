const webpack = require('webpack');

module.exports = {
    entry: {
        client: ['babel-polyfill', './src/client.js'],
        stats: ['babel-polyfill', './src/stats.js'],
        enter: ['babel-polyfill', './src/enter.js'],
        classes: ['babel-polyfill', './src/classes.js'],
        settings: ['babel-polyfill', './src/settings.coffee'],
        periods: ['babel-polyfill', './src/periods.coffee'],
        online: ['babel-polyfill', './src/online.js']
    },
    resolve: {
        alias: {}
    },
    output: {
        path: __dirname + '/bin/',
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.coffee$/,
            use: ['coffee-loader']
        }, {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                }
            }
        }]
    }
};