'use strict';

const fs = require('fs');
const gulp = require('gulp');
const connect = require('gulp-connect');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const log = require('fancy-log');
const c = require('ansi-colors');

let currentConfig = './.markguiderc.current.json';
if (fs.existsSync(currentConfig) === false) {
    currentConfig = './.markguiderc.json';
}

log('Current config file is: ' + c.cyan(currentConfig));

const markguide = require('./src/markguide.js').withConfig(currentConfig);
const config = require(currentConfig);

// Styles source
config.sassSrc = './scss/';
config.sassDest = './assets/css/';
config.alsoSearchIn = '';

log('Style Guide scss folder: ' + c.cyan(config.sassSrc));
log('Style Guide assets compiled css folder: ' + c.cyan(config.sassDest));

let changedFilePath = '';

/*
 * Local server for static assets with live reload
 */

gulp.task('server:up', done => {
    const cors = (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    };

    connect.server({
        root: [
            config.guideDest,
            config.projectCompiledFiles
        ],
        port: 5000,
        host: '0.0.0.0',
        livereload: {
            start: true,
            port: 9000
        },
        middleware() {
            return [cors];
        },
        https: false // disable it due to https://github.com/intesso/connect-livereload/issues/79
    });

    done();
});

// Reload the page right after 'markguide:compile:incremental' task is returned
gulp.task('server:reload:guide', () =>
    gulp.src(config.guideDest + '*.html') // full page reload
        .pipe(connect.reload()));

/*
 * Sass compilation
 */

const notifyChange = path => {
    changedFilePath = path;
    log('[CHANGED:] ' + c.green(path));
};

/**
 * Configurable Sass compilation
 * @param {Object} config
 */
const sassCompile = config => {
    const postProcessors = [
        autoprefixer({
            flexbox: 'no-2009'
        })
    ];

    log('[SCSS COMPILE:] ' + c.magenta(config.source));
    log('[SCSS COMPILE OUTPUT:] ' + c.magenta(config.dest));

    return gulp.src(config.source, {allowEmpty: true})
        // .pipe(sourcemaps.init({
        //     loadMaps: true,
        //     largeFile: true
        // }))
        .pipe(sass({
            includePaths: config.alsoSearchIn,
            sourceMap: false,
            outputStyle: 'expanded',
            indentType: 'tab',
            indentWidth: '1',
            linefeed: 'lf',
            precision: 10,
            errLogToConsole: true
        }))
        .on('error', function (error) {
            log(c.red(error.message));
            this.emit('end');
        })
        .pipe(postcss(postProcessors))
        // .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dest))
        .pipe(connect.reload());
};

// Compile assets scss
gulp.task('styles:compile:all', () => sassCompile({
    source: config.sassSrc + '*.scss',
    dest: config.sassDest,
    alsoSearchIn: [config.alsoSearchIn]
}));

// Compile assets scss into guide destination
gulp.task('styles:compile:all2', () => sassCompile({
    source: config.sassSrc + '*.scss',
    dest: config.guideDest + 'assets/css/',
    alsoSearchIn: [config.alsoSearchIn]
}));

// Compile all Sass files and watch for changes
gulp.task('scss:watch', done => {
    gulp.watch(
        config.sassSrc + '**/*.scss',
        gulp.series('styles:compile:all2')
    ).on('change', notifyChange);
    done();
});

/*
 * Guide generation
 */


// Compile all components pages
gulp.task('markguide:compile', done => markguide.build().then(done()));

// Compile particular page from the guide
gulp.task('markguide:compile:incremental', done => markguide.build(changedFilePath).then(done()));

gulp.task('markguide:compile:all', done => markguide.buildAll().then(done()));

// Compile Guide and watch changes
gulp.task('markguide:watch', done => {
    gulp.watch(
        [config.guideSrc + '**/*.scss', config.guideSrc + '**/*.md'],
        gulp.series('markguide:compile:incremental', 'server:reload:guide')
    ).on('change', notifyChange);
    done();
});

/*
 * Complex tasks
 */

gulp.task('dev', gulp.parallel('server:up', 'styles:compile:all2', 'scss:watch'));


// change to markguide:compile for regular projects, for our cases we compile all markguide in dev workflow
gulp.task('dev:markguide', gulp.parallel('server:up', 'markguide:compile:all', 'markguide:watch'));
gulp.task('build', gulp.parallel('styles:compile:all', 'styles:compile:all2', 'markguide:compile:all'));
