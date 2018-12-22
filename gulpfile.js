const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("autoprefixer");
const browserSync = require("browser-sync").create();
const useref = require("gulp-useref");
const uglify = require("gulp-uglify");
const gulpIf = require("gulp-if");
const cssnano = require("gulp-cssnano");
const imagemin = require("gulp-imagemin");
const cache = require("gulp-cache");
const postcss = require("gulp-postcss");
const del = require("del");
const runSequence = require("run-sequence");
const sitemap = require("gulp-sitemap");
const notify = require("gulp-notify");
const removeLogging = require("gulp-remove-logging");
const babelify = require("babelify");
const browserify = require("browserify");
const vinylSourceStream = require("vinyl-source-stream");
const streamify = require('gulp-streamify');
const es = require("event-stream");
const rename = require("gulp-rename");
const glob = require("glob");
const htmlmin = require("gulp-htmlmin");
const fs = require("fs");
const plumber = require("gulp-plumber");

const argv = require("minimist")(process.argv.slice(2));

/**
 * References:
 *  1. https://stackoverflow.com/questions/23023650/is-it-possible-to-pass-a-flag-to-gulp-to-have-it-run-tasks-in-different-ways
 */
const CONFIG = require('./_config_.js');
const DIRS = CONFIG.dirs;
const SERVER = CONFIG.server;
const ENV_PROD = argv['prod'];

if (argv['_'].includes('build') && ENV_PROD) {
  console.info('*** Building using Prod Mode ***');
}

const onError = function (err) {
  notify.onError({
    title: "Error",
    message: "<%= error %>",
  })(err);
  this.emit('end');
};

const plumberOptions = {
  errorHandler: onError,
};

// ******* Tasks *******

gulp.task('update-config', function () {
  /**
   * @ref
   *  https://stackoverflow.com/questions/36856232/write-add-data-in-json-file-using-node-js
   */
  let JSONconfig = JSON.stringify(CONFIG, null, '\t');
  
  fs.writeFile('_config_.json', JSONconfig, 'utf8', function (e) {
    console.info('JSON config updated!');
  });
});


// ******* Development Tasks *******


/**
 * Start browserSync server
 *
 * References:
 *  https://browsersync.io/docs/options
 *  https://browsersync.io/docs/gulp
 *  http://stackoverflow.com/questions/28962528/browsersync-cannot-get
 */
gulp.task('browserSync', function () {
  
  if (["info", "debug", "warn", "silent"].indexOf(argv['l']) === -1) {
    argv['l'] = 'info';
  }
  
  var bsConf = {
    server: {
      baseDir: DIRS.src.root,
      index: "index.html"
    },
    watch: true || argv['no-watch'],
    open: argv['o'] || false,
    reloadOnRestart: true,
    port: SERVER.port,
    ghostMode: argv['g'] || false, // for disabling synced control
    logLevel: argv['l'], // "info", "debug", "warn", or "silent"
    logPrefix: CONFIG.name,
    logConnections: argv['l'] === "debug" || false,
    logFileChanges: argv['l'] === "debug" || false,
    logSnippet: argv['l'] === "debug" || false,
    scrollThrottle: 100
  };
  
  browserSync.init(bsConf);
});


/**
 * https://stackoverflow.com/questions/33585617/what-does-gulps-includepaths-do
 */
gulp.task('compile-sass', function () {
  return gulp.src(DIRS.src.scss + '/**/*.scss') // Gets all files ending with .scss in www/scss and children dirs
    .pipe(plumber(plumberOptions))
    .pipe(sass({
      outFile: DIRS.src.root, // required for sourceMap option
      sourceMapEmbed: true,
      sourceMap: ENV_PROD ? false : true,
      sourceComments: ENV_PROD ? false : true,
      outputStyle: ENV_PROD ? 'compressed' : 'expanded', // nested, expanded, compact, compressed
      errLogToConsole: true,
      onError: console.log,
    })
    .on('error', sass.logError))
    .pipe(postcss([autoprefixer({
      browsers: ['> 1%', 'last 3 versions', 'IE >= 8'],
      cascade: true
    })]))
    .pipe(gulp.dest(DIRS.src.css)) // Outputs it in the css folder
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
    }))
    /*
    .pipe(notify({
      message: 'Compiled Sass',
      // message: 'Compiled Sass file: <%= file.relative %> @ <%= options.date %>',
      templateOptions: {
        date: new Date()
      }
    }));
    */
});


/**
 * @ref
 *  1. http://foundation.zurb.com/forum/posts/42835-copy-some-js-files-into-dist-without-bundling-into-appjs
 *  2. http://macr.ae/article/gulp-and-babel.html
 */
gulp.task('compile-js', function (__done) {
  
  // reads only first level js files
  glob(DIRS.src.devJs + '/*.js', function (err, files) {
    if (err) __done(err);
    
    var tasks = files.map(function (entry) {
      return browserify({
        entries: [entry]
      })
        .transform(babelify.configure({
          presets: ['es2015','stage-0']
        }))
        .bundle()
        .pipe(vinylSourceStream(entry))
        .pipe(gulpIf(ENV_PROD, removeLogging({
          namespace: ['console', 'window.console']
        })))
        .pipe(streamify(gulpIf(ENV_PROD, uglify({
          warnings: true,
        }))))
	      .pipe(plumber(plumberOptions))
        .pipe(rename(function (path) {
          // reset the path
          path.dirname = '';
        }))
        .pipe(gulp.dest(DIRS.src.js))
        .pipe(browserSync.reload({ // Reloading with Browser Sync
          stream: true
        }));
    });
    es.merge(tasks).on('end', __done);
  });
});


// Watchers
gulp.task('watch', function () {
  gulp.watch(DIRS.src.scss + '/**/*.scss', ['compile-sass']);
  gulp.watch(DIRS.src.root + '/**/*.+(html|php)', browserSync.reload);
  gulp.watch(DIRS.src.devJs + '/**/*.js', ['compile-js'], browserSync.reload);
});


// ******* Optimization Tasks *******


// Optimizing CSS and JavaScript
gulp.task('useref', function () {
  return gulp.src(DIRS.src.root + '/**/*.+(html|php)')
    .pipe(useref())
    // this takes up the file from html which is referring to the compiled verson
    .pipe(gulpIf('*.html', htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      minifyURLs: true,
      removeComments: true,
      keepClosingSlash: true
    })))
    .pipe(gulp.dest(DIRS.dest.root));
});


// Optimizing Images
gulp.task('optimize-images', function () {
  return gulp.src(DIRS.src.images + '/**/*.+(png|jpg|jpeg|gif|svg)')
  // Caching images that ran through imagemin
    .pipe(imagemin({
      interlaced: true,
      verbose: true
    }))
    .pipe(gulp.dest(DIRS.dest.images))
});


// Copying fonts
gulp.task('fonts', function () {
  return gulp.src(DIRS.src.fonts + '/**/*')
    .pipe(gulp.dest(DIRS.dest.fonts))
});


// Cleaning
gulp.task('clean', function () {
  return del.sync(DIRS.dest.root).then(function (cb) {
    return cache.clearAll(cb);
  });
});


gulp.task('clean:dest', function () {
  return del.sync([DIRS.dest.root + '/**/*', '!' + DIRS.dest.images, '!' + DIRS.dest.images + '/**/*']);
});


// strip logs in js files
gulp.task('strip-logs', function () {
  return gulp.src(DIRS.src.js + '/**/*.js')
    .pipe(removeLogging({
      // Options (optional)
      // eg:
      // namespace: ['console', 'window.console']
    }))
    .pipe(gulp.dest(
      'build/javascripts/'
    ));
});


/**
 * Copy files to destination. Can also make changes to file names and dest path
 */
gulp.task('copy:build', function () {

  var filesToCopy = [
    DIRS.src.css + '/**/*',
    DIRS.src.js + '/**/*',
    DIRS.src.favicons + '/**/*',
    DIRS.src.root + '/*.htaccess',
  ];

  return gulp.src(filesToCopy, {
    base: DIRS.src.root
  })
    .pipe(gulpIf('*.htaccess', rename(function (__path) {
      console.log('Renaming "' + __path.basename + __path.extname + '" -> "' + __path.extname + '"');
      __path.basename = ''; // renaming the dirname to the desired dir
    })))
    .pipe(gulpIf('*.js', rename(function (__path) {
      __path.dirname = __path.dirname.replace('src', 'compiled');
    })))
    .pipe(gulp.dest(DIRS.dest.root));
});


// Sitemap
gulp.task('create-sitemap', function () {
  gulp.src('*.+(html|php)', {
    read: false
  })
    .pipe(sitemap({
      siteUrl: CONFIG.siteUrl
    }))
    .pipe(gulp.dest(DIRS.dest.root));
});


gulp.task('run-dev', function (callback) {
  runSequence('update-config', ['compile-sass', 'compile-js', 'browserSync'], 'watch',
    callback
  )
});


gulp.task('build', function (callback) {
  runSequence(
    'update-config',
    'clean:dest',
    'compile-sass',
    'compile-js',
    ['useref', 'optimize-images', 'fonts'],
    'copy:build',
    // 'create-sitemap',
    callback
  )
});
