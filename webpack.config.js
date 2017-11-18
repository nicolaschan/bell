const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: {
        client: ['./src/client.js'],
        stats: ['./src/stats.js'],
        enter: ['./src/enter.js'],
        classes: ['./src/classes.js'],
        settings: ['./src/settings.coffee'],
        periods: ['./src/periods.coffee'],
        online: ['./src/online.js']
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
            test: /\.js$|\.jsx$/,
            use: {
                loader: 'istanbul-instrumenter-loader',
                options: {
                    esModules: true
                }
            },
            enforce: 'post',
            exclude: /node_modules|\.spec\.js$/,
        }]
    },
    plugins: [new UglifyJsPlugin({
        cache: true
    })]
};