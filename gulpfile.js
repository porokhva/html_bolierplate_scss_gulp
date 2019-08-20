'use strict';

let gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    babel = require("gulp-babel"),
    concat = require("gulp-concat"),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    gcmq = require('gulp-group-css-media-queries'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    recompress = require('imagemin-jpeg-recompress'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

let path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/*.js',
        style: 'src/style/main.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

let config = {
    server: {
        baseDir: "./build"
    },
    // tunnel: true,
    host: 'localhost',
    port: 8080,
    logPrefix: "frontend"
};

gulp.task('webserver', () => {
    browserSync(config);
});

gulp.task('clean', (cb) => {
    rimraf(path.clean, cb);
});

gulp.task('html:build', () => {
    gulp.src(path.src.html, { allowEmpty: true }) 
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', () => {
    gulp.src(path.src.js, { allowEmpty: true }) 
        .pipe(rigger()) 
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('main.js'))
        .pipe(uglify()) 
        .pipe(sourcemaps.write()) 
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', () => {
    gulp.src(path.src.style) 
        .pipe(sourcemaps.init())
        .pipe(sass({
            sourceMap: true,
            errLogToConsole: true,
            outputStyle: 'expanded'
        }))
        .pipe(prefixer(['last 3 versions']))
        .pipe(gcmq())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}))
        
    });

gulp.task('image:build', () => {
    gulp.src(path.src.img, { allowEmpty: true }) 
        .pipe(imagemin([
            
            pngquant(),
            recompress({
              loops: 4,
              min: 70,
              max: 80,
              quality: 'high'
            }),
            imagemin.gifsicle(),
            imagemin.optipng(),
            imagemin.svgo()
          ]))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', () => {
    gulp.src(path.src.fonts, { allowEmpty: true })
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', gulp.parallel(
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
    ));


gulp.task('watch', () => {
    watch(path.watch.html, gulp.parallel("html:build"));
    watch(path.watch.style, gulp.parallel("style:build"));
    watch(path.watch.js, gulp.parallel("js:build"));
    watch(path.watch.img, gulp.parallel("image:build"));
    watch(path.watch.fonts, gulp.parallel("fonts:build"));
});


gulp.task('default', gulp.parallel('build', 'webserver', 'watch'));