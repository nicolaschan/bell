const path = require('path');

module.exports = function(config) {
    config.set({
        // ... normal karma configuration
        files: [
            // all files ending in "_test"
            {
                pattern: 'test/*.js',
                watched: false
            }
            // each file acts as entry point for the webpack configuration
        ],
        frameworks: ['mocha'],
        preprocessors: {
            // add webpack as preprocessor
            'test/*.js': ['webpack']
        },

        reporters: ['spec', 'coverage'],

        coverageReporter: {

            dir: 'coverage/',
            reporters: [{
                type: 'html'
            }, {
                type: 'text'
            }, {
                type: 'lcov'
            }, {
                type: 'text-summary'
            }]
        },

        webpack: {
            // karma watches the test entry points
            // (you don't need to specify the entry option)
            // webpack watches dependencies

            // webpack configuration

            node: {
                fs: 'empty'
            },

            // Instrument code that isn't test or vendor code.
            module: {
                rules: [
                    // instrument only testing sources with Istanbul
                    {
                        test: /\.js$/,
                        use: {
                            loader: 'istanbul-instrumenter-loader'
                        },
                        include: path.resolve('src/')
                    }
                ]
            }
        },

        plugins: [
            require("karma-webpack"),
            require("istanbul-instrumenter-loader"),
            require("karma-mocha"),
            require("karma-coverage"),
            require("karma-coverage-istanbul-reporter"),
            require("karma-phantomjs-launcher"),
            require("karma-spec-reporter")
        ],

        webpackMiddleware: {
            // webpack-dev-middleware configuration
            // i. e.
            stats: 'errors-only'
        }
    });
};