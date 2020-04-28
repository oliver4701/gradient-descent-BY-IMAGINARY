const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const touch = require('gulp-touch-fd');
const pugData = require('./pug/data.js');

const OUTPUT_DIR = '..';

const JS_BUNDLE_NAME = 'bundle';
const DEPS_BUNDLE_NAME = 'dependencies';

const paths = {
  html: {
    src: ['./pug/**/*.pug', '!./pug/include/**/*.pug', '!./pug/tpl/**/*.pug', '!./pug/sections/**/*.pug'],
    watchSrc: './pug/**/*.pug',
    dest: `${OUTPUT_DIR}`,
  },
  styles: {
    src: './sass/**/*.scss',
    watchSrc: './sass/**/*.scss',
    dest: `${OUTPUT_DIR}/assets/css`,
  },
  scripts: {
    watchSrc: ['./js/**/*.js', '!./js/dependencies.js'],
    dest: `${OUTPUT_DIR}/assets/js`,
  },
  dependencies: {
    watchSrc: './js/dependencies.js',
  },
};

function html() {
  return gulp.src(paths.html.src)
    .pipe(pug({
      pretty: true,
      data: pugData,
    })).pipe(rename({
      extname: '.html',
    })).pipe(
      gulp.dest(paths.html.dest)
    )
    .pipe(touch());
}

function styles() {
  return gulp.src(paths.styles.src, { sourcemaps: true })
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest));
}

function es(entrypoint, outputName) {
  return browserify({
    extensions: ['.js', '.jsx'],
    entries: entrypoint,
    debug: true,
  })
    .transform('babelify', { presets: ['@babel/env'], sourceMaps: true })
    .on('error', (msg) => {
      // eslint-disable-next-line no-console
      console.error(msg);
    })
    .bundle()
    .pipe(source(`${outputName}.js`))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(uglify())
    .pipe(rename(`${outputName}.min.js`))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest));
}

function dependencies() {
  return es('./js/dependencies.js', DEPS_BUNDLE_NAME);
}

function scripts() {
  return es('./js/main.js', JS_BUNDLE_NAME);
}

function watch() {
  gulp.watch(paths.html.watchSrc, html);
  gulp.watch(paths.styles.watchSrc, styles);
  gulp.watch(paths.scripts.watchSrc, scripts);
  gulp.watch(paths.dependencies.watchSrc, dependencies);
}

const build = gulp.parallel(html, styles, scripts);

exports.html = html;
exports.styles = styles;
exports.dependencies = dependencies;
exports.scripts = scripts;
exports.watch = watch;

exports.build = build;
exports.default = build;
