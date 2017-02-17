var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task('default', shell.task([
  //'browserify -r async client.js -o bundle.js',
  //'cp client.js js/client.js',
  //'cp SimpleLogger.js js/SimpleLogger.js',
  //'cp BellTimer.js js/BellTimer.js',
  'browserify js/client.js -r async -r lodash -r jquery -r js-cookie -r ./js/BellTimer.js -r ./js/SimpleLogger.js > js/bundle.js',
  'uglifyjs -c -m -- js/bundle.js > js/bundle.min.js',
  //'cp js/bundle.js js/bundle.min.js',
  'node index.js'
]));