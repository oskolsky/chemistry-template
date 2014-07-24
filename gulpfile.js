//****************************************************************************************************
//
// .. VARIABLES
//
//****************************************************************************************************
var
  gulp = require('gulp'),
  ignore = require('gulp-ignore'),
  clean = require('gulp-clean'),
  haml = require('gulp-ruby-haml'),
  htmlreplace = require('gulp-html-replace'),
  sass = require('gulp-ruby-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cssmin = require('gulp-cssmin'),
  jshint = require('gulp-jshint'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  imagemin = require('gulp-imagemin'),
  connect = require('gulp-connect'),
  watch = require('gulp-watch');

var paths = {
  layouts: {
    src: ['./**/*.haml', '!./views/**/*'],
    dest: './build'
  },
  stylesheets: {
    src: './assets/stylesheets/application.scss',
    dest: './build/assets/stylesheets'
  },
  javascripts: {
    src: [
      './assets/javascripts/vendor/modernizr-latest.js',
      // './assets/javascripts/vendor/require.js',
      './assets/javascripts/vendor/jquery-2.1.1.js',
      './assets/javascripts/vendor/jquery-ui.js',
      './assets/javascripts/vendor/underscore.js',
      './assets/javascripts/vendor/backbone.js',
      './assets/javascripts/vendor/owl.carousel.js',
      './assets/javascripts/vendor/jquery.arcticmodal.js',
      './assets/javascripts/vendor/selectordie.js',
      './assets/javascripts/vendor/imagesloaded.pkgd.js',
      './assets/javascripts/vendor/masonry.pkgd.js',
      './assets/javascripts/vendor/accounting.js',
      './assets/javascripts/polyfills/polyfills.js',
      './assets/javascripts/config.js',
      './assets/javascripts/jquery.extensions.js',
      './assets/javascripts/helpers.js',
      './assets/javascripts/forms.js',
      './assets/javascripts/application.js',
      './assets/javascripts/project.js'
    ],
    dest: './build/assets/javascripts'
  },
  images: {
    src: './assets/images/**/*',
    dest: './build/assets/images'
  },
  fonts: {
    src: './assets/fonts/**/*',
    dest: './build/assets/fonts'
  }
};



//****************************************************************************************************
//
// .. TASKS
//
//****************************************************************************************************
//
// .. Clean
//
gulp.task('clean', function() {
  return gulp.src('./build', {read: false})
    .pipe(clean());
});

//
// .. Layouts
//
gulp.task('layouts:development/staging', function() {
  return gulp.src(paths.layouts.src)
    .pipe(haml({doubleQuote: true}))
    .pipe(gulp.dest(paths.layouts.dest));
});

gulp.task('layouts:production', ['layouts:development/staging'], function() {
  return gulp.src('./build/**/*.html')
    .pipe(htmlreplace({javascripts: {src: '/assets/javascripts/application.js', tpl: '<script src=\'%s\'></script>'}}))
    .pipe(gulp.dest('./build'));
});

//
// .. Stylesheets
//
gulp.task('stylesheets:development', function() {
  return gulp.src(paths.stylesheets.src)
    .pipe(sass({noCache: true}))
    .pipe(gulp.dest(paths.stylesheets.dest));
});

gulp.task('stylesheets:staging', ['stylesheets:development'], function() {
  return gulp.src('./build/assets/stylesheets/application.css')
    .pipe(autoprefixer('last 2 versions', 'ie 9'))
    .pipe(gulp.dest(paths.stylesheets.dest));
});

gulp.task('stylesheets:production', ['stylesheets:staging'], function() {
  return gulp.src('./build/assets/stylesheets/application.css')
    .pipe(cssmin())
    .pipe(gulp.dest(paths.stylesheets.dest));
});

//
// .. Javascripts
//
gulp.task('javascripts:staging', function() {
  return gulp.src(['./assets/javascripts/*.js', './assets/javascripts/polyfills/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter());
});

gulp.task('javascripts:production', ['javascripts:staging'], function() {
  return gulp.src(paths.javascripts.src)
    .pipe(concat('application.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.javascripts.dest))
});

//
// .. Images
//
gulp.task('images', function() {
  gulp.src(paths.images.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dest));
});

//
// .. Copy
//
gulp.task('copy:stylesheets:vendor', function() {
  gulp.src('./assets/stylesheets/vendor/**/*')
    .pipe(gulp.dest('./build/assets/stylesheets/vendor'));
});

gulp.task('copy:javascripts', function() {
  gulp.src('./assets/javascripts/**/*.js')
    .pipe(gulp.dest('./build/assets/javascripts'));
});

gulp.task('copy:javascripts:polyfills', function() {
  gulp.src('./assets/javascripts/polyfills/vendor/**/*.js')
    .pipe(gulp.dest('./build/assets/javascripts/polyfills/vendor'));
});

gulp.task('copy:images', function() {
  gulp.src(paths.images.src)
    .pipe(gulp.dest(paths.images.dest));
});

gulp.task('copy:fonts', function() {
  gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest));
});

gulp.task('copy:files', function() {
  gulp.src([
    './favicon.ico',
    './humans.txt',
    './robots.txt'
  ])
    .pipe(gulp.dest('./build'));
});

//
// .. Connect
//
gulp.task('connect', function() {
  connect.server({
    root: ['./build'],
    port: 1111
  });
});

//
// .. Watch
//
gulp.task('watch', function() {
  gulp.src(['./**/*.haml', '!./views/**/*.haml'], {read: false})
    .pipe(watch())
    .pipe(haml({doubleQuote: true}))
    .pipe(gulp.dest(paths.layouts.dest));
  gulp.watch(['./views/**/*.haml'], ['layouts:development/staging']);
  gulp.watch(['./assets/stylesheets/**/*.scss'], ['stylesheets:development']);
  gulp.watch(['./assets/stylesheets/vendor/**/*.css'], ['copy:stylesheets:vendor']);
  gulp.watch(['./assets/javascripts/**/*.js'], ['copy:javascripts']);
  gulp.watch(['./assets/images/**/*'], ['copy:images']);
  gulp.watch(['./favicon.ico', './humans.txt', './robots.txt'], ['copy:files']);
});



//****************************************************************************************************
//
// .. RUN
//
//****************************************************************************************************
gulp.task('default', ['connect', 'watch']);

gulp.task('development', ['clean'], function() {
  gulp.start(
    'layouts:development/staging',
    'stylesheets:development',
    'copy:stylesheets:vendor',
    'copy:javascripts',
    'copy:images',
    'copy:fonts',
    'copy:files'
  );
});

gulp.task('staging', ['clean'], function() {
  gulp.start(
    'layouts:development/staging',
    'stylesheets:staging',
    'javascripts:staging',
    'images',
    'copy:stylesheets:vendor',
    'copy:javascripts',
    'copy:fonts',
    'copy:files'
  );
});

gulp.task('production', ['clean'], function() {
  gulp.start(
    'layouts:production',
    'stylesheets:production',
    'javascripts:production',
    'images',
    'copy:javascripts:polyfills',
    'copy:fonts',
    'copy:files'
  );
});