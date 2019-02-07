var gulp         = require('gulp');
var gulpSequence = require('gulp-sequence');

gulp.task('build:development', function(cb) {
  //gulpSequence('clean', 'copy', ['fonts', 'images'], ['html'], ['webpack-dev-server'], cb);
  gulpSequence('clean' , 'copy', 'copy-game-assets', ['html', 'images'], ['webpack-dev-server'], cb);
});
