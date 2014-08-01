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

var path = {
  build: './build',
  layouts: {
    all: './**/*.haml',
    views: {
      yep: './views/**/*.haml',
      nope: '!./views/**/*.haml'
    },
    build: {
      all: './build/**/*.html'
    }
  },
  stylesheets: {
    all: './assets/stylesheets/**/*.scss',
    app: './assets/stylesheets/application.scss',
    dest: './build/assets/stylesheets',
    vendor: {
      all: './assets/stylesheets/vendor/**/*.css',
      dest: './build/assets/stylesheets/vendor'
    },
    build: {
      app: './build/assets/stylesheets/application.css'
    }
  },
  javascripts: {
    all: './assets/javascripts/**/*.js',
    app: '/assets/javascripts/application.js',
    list: [
      './assets/javascripts/vendor/modernizr-latest.js',
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
    dest: './build/assets/javascripts',
    vendor: {
      nope: '!./assets/javascripts/**/vendor/*.js'
    },
    polyfills: {
      all: './assets/javascripts/polyfills/vendor/**/*.js',
      dest: './build/assets/javascripts/polyfills/vendor' 
    }
  },
  images: {
    all: './assets/images/**/*',
    dest: './build/assets/images'
  },
  fonts: {
    all: './assets/fonts/**/*',
    dest: './build/assets/fonts'
  },
  files: {
    list: [
      './favicon.ico',
      './humans.txt',
      './robots.txt'
    ]
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
  return gulp.src(path.build, {read: false})
    .pipe(clean());
});

//
// .. Layouts
//
gulp.task('layouts:development/staging', function() {
  return gulp.src([path.layouts.all, path.layouts.views.nope])
    .pipe(haml({doubleQuote: true}))
    .pipe(gulp.dest(path.build));
});

gulp.task('layouts:production', ['layouts:development/staging'], function() {
  return gulp.src(path.layouts.build.all)
    .pipe(htmlreplace({javascripts: {src: path.javascripts.app, tpl: '<script src=\'%s\'></script>'}}))
    .pipe(gulp.dest(path.build));
});

//
// .. Stylesheets
//
gulp.task('stylesheets:development', function() {
  return gulp.src(path.stylesheets.app)
    .pipe(sass({noCache: true}))
    .pipe(gulp.dest(path.stylesheets.dest));
});

gulp.task('stylesheets:staging', ['stylesheets:development'], function() {
  return gulp.src(path.stylesheets.build.app)
    .pipe(autoprefixer('last 2 versions', 'ie 9'))
    .pipe(gulp.dest(path.stylesheets.dest));
});

gulp.task('stylesheets:production', ['stylesheets:staging'], function() {
  return gulp.src(path.stylesheets.build.app)
    .pipe(cssmin())
    .pipe(gulp.dest(path.stylesheets.dest));
});

//
// .. Javascripts
//
gulp.task('javascripts:staging', function() {
  return gulp.src([path.javascripts.all, path.javascripts.vendor.nope])
    .pipe(jshint())
    .pipe(jshint.reporter());
});

gulp.task('javascripts:production', ['javascripts:staging'], function() {
  return gulp.src(path.javascripts.list)
    .pipe(concat('application.js'))
    .pipe(uglify())
    .pipe(gulp.dest(path.javascripts.dest))
});

//
// .. Images
//
gulp.task('images', function() {
  gulp.src(path.images.all)
    .pipe(imagemin())
    .pipe(gulp.dest(path.images.dest));
});

//
// .. Copy
//
gulp.task('copy:stylesheets:vendor', function() {
  gulp.src(path.stylesheets.vendor.all)
    .pipe(gulp.dest(path.stylesheets.vendor.dest));
});

gulp.task('copy:javascripts', function() {
  gulp.src(path.javascripts.all)
    .pipe(gulp.dest(path.javascripts.dest));
});

gulp.task('copy:javascripts:polyfills', function() {
  gulp.src(path.javascripts.polyfills.all)
    .pipe(gulp.dest(path.javascripts.polyfills.dest));
});

gulp.task('copy:images', function() {
  gulp.src(path.images.all)
    .pipe(gulp.dest(path.images.dest));
});

gulp.task('copy:fonts', function() {
  gulp.src(path.fonts.all)
    .pipe(gulp.dest(path.fonts.dest));
});

gulp.task('copy:files', function() {
  gulp.src(path.files.list)
    .pipe(gulp.dest(path.build));
});

//
// .. Connect
//
gulp.task('connect', function() {
  connect.server({
    root: [path.build],
    port: 1111
  });
});

//
// .. Watch
//
gulp.task('watch', function() {
  gulp.src([path.layouts.all, path.layouts.views.nope], {read: false})
    .pipe(watch())
    .pipe(haml({doubleQuote: true}))
    .pipe(gulp.dest(path.build));
  gulp.watch(path.layouts.views.yep, ['layouts:development/staging']);
  gulp.watch(path.stylesheets.all, ['stylesheets:development']);
  gulp.watch(path.stylesheets.vendor.all, ['copy:stylesheets:vendor']);
  gulp.watch(path.javascripts.all, ['copy:javascripts']);
  gulp.watch(path.images.all, ['copy:images']);
  gulp.watch(path.files.list, ['copy:files']);
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