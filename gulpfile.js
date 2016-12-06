'use strict'

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    autoprefixer = require('gulp-autoprefixer'),
    htmlmin = require('gulp-htmlmin'),
    cleanCss = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    browser = require('browser-sync').create(),
    reload = browser.reload;

gulp.task('script', function() {
    return gulp.src('src/js/**/*.js')
        // .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('style', function() {
    return gulp.src('src/sass/**/*.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['>1%']
        }))
        // .pipe(cleanCss())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('images', function() {
    return gulp.src('src/imgs/**/*.*')
        .pipe(gulp.dest('dist/imgs'));
});

gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist'));
});

gulp.task('server', ['script', 'style', 'html'], function() {
    browser.init({
        server: {
            baseDir: './dist'
        }
    });

    gulp.watch('src/*.html').on('change', reload);
});

gulp.task('auto', ['server'], function() {
    gulp.watch(['src/sass/**/*.scss', 'src/js/**/*.js', 'src/img/**/*.*', 'src/*.html'],['style', 'script', 'images', 'html']).on('change', reload);
});
