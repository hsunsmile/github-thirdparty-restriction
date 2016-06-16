var gulp = require("gulp");
var gutil = require('gulp-util');
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var bower = require('gulp-bower');
var sass = require('gulp-sass');
var webpack = require('gulp-webpack');

var config = {
  componentPath: './src/assets/javascripts',
  sassPath: './src/assets/sass',
  bowerDir: './bower_components'
}

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest(config.bowerDir))
});

var jsFiles = {
  vendor: [
    config.bowerDir + '/jquery/dist/jquery.js',
    config.bowerDir + '/react/react.js',
    config.bowerDir + '/react/react-dom.js',
    config.bowerDir + '/bootstrap/dist/js/bootstrap.js',
    config.bowerDir + '/lodash/dist/lodash.js',
    config.bowerDir + '/tablesorter/dist/js/jquery.tablesorter.js'
  ],
  source: [
    config.componentPath + '/**/*.jsx'
  ]
};

var cssFiles = {
  vendor: [
    config.bowerDir + '/bootstrap/dist/css/bootstrap.min.css',
    config.bowerDir + '/bootstrap-social/bootstrap-social.css',
    config.bowerDir + '/tablesorter/dist/css/theme.bootstrap.min.css'
  ],
  source: [
    config.sassPath + '/**/*.scss'
  ]
};

gulp.task("buildCSS", function () {
  return gulp.src(cssFiles.vendor.concat(cssFiles.source))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(concat("application.css"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("public/css"));
});

gulp.task("buildApp", function () {
  return gulp.src(jsFiles.vendor.concat(jsFiles.source))
    .pipe(sourcemaps.init())
    .pipe(webpack({
      watch: true,
      entry: 'application.jsx',
      output: {
        filename: 'application.js'
      },
      module: {
        loaders: [{
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel'
        }]
      },
    }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("public/js"));
});

gulp.task('watch', function() {
  gulp.watch(config.sassPath + '/**/*.scss', ['buildCSS']);
  gulp.watch(config.componentPath + '/**/*.jsx', ['buildApp']);
});

gulp.task('default', ['bower', 'buildCSS', 'buildApp']);
