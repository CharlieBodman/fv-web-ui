var gulp     = require('gulp');
var html     = require('../config/html')('development');
var images   = require('../config/images');
var less     = require('../config/less');
var fonts    = require('../config/fonts');
var watch    = require('gulp-watch');

gulp.task('watch', ['browserSync'], function() {
  watch(images.src, function() { gulp.start('images'); });
  watch(less.src, function() { gulp.start('less'); });
  watch(fonts.src, function() { gulp.start('fonts'); });
  watch(html.watch, function() { gulp.start('html'); });
});
