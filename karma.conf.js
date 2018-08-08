process.env.CHROME_BIN = require('puppeteer').executablePath()
const path = require('path')

module.exports = function (config) {
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
      'test/**/*': ['webpack', 'sourcemap']
    },

    reporters: ['spec', 'coverage-istanbul'],

    coverageIstanbulReporter: {
      reports: ['text', 'json-summary', 'text-summary', 'cobertura', 'html'],
      dir: path.join(__dirname, 'coverage')
    },

    webpack: {
      // karma watches the test entry points
      // (you don't need to specify the entry option)
      // webpack watches dependencies

      // webpack configuration
      mode: 'development',
      module: {
        rules: [{
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader'
          },
          exclude: /node_modules/
        }, {
          test: /\.(js|ts)x?$/,
          use: {
            loader: 'istanbul-instrumenter-loader',
            options: {
              esModules: true
            }
          },
          enforce: 'post',
          include: path.resolve('src/')
        }]
      },
      resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
      }
    },
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    plugins: [
      require('karma-sourcemap-loader'),
      require('karma-webpack'),
      require('istanbul-instrumenter-loader'),
      require('karma-mocha'),
      require('karma-coverage'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-spec-reporter'),
      require('karma-firefox-launcher'),
      require('karma-chrome-launcher')
    ],

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
    }
  })
}
