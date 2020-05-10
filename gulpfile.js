'use strict';

let gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    babel = require("gulp-babel"),
    del = require('del'),
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
    grid = require("smart-grid"),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    reload = browserSync.reload;

/* It's principal settings in smart grid project */
var settings = {
    outputStyle: 'scss', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: '30px', /* gutter width px || % || rem */
    mobileFirst: false, /* mobileFirst ? 'min-width' : 'max-width' */
    container: {
        maxWidth: '1600px', /* max-width оn very large screen */
        fields: '30px' /* side fields */
    },
    breakPoints: {
        lg: {
            width: '1440px', /* -> @media (max-width: 1100px) */
        },
        md: {
            width: '960px'
        },
        sm: {
            width: '780px',
            fields: '15px' /* set fields only if you want to change container.fields */
        },
        xs: {
            width: '560px',
            fields: '15px'
        }
    }
};
//Smartgrid output path
grid('./src/style/utils', settings);

let path = {
    build: {
        html: 'build/',
        js: 'build/static/js/',
        css: 'build/static/css/',
        img: 'build/static/img/',
        fonts: 'build/static/fonts/'
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
    port: 3001,
    logPrefix: "frontend"
};

gulp.task('webserver', () => {
    browserSync(config);
});



gulp.task('clean', function (cb) {
    del.sync(['./build']);
    cb()
});

gulp.task('html:build', () => {
    return gulp.src(path.src.html, { allowEmpty: true })
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({ stream: true }));
});

gulp.task('js:build', () => {
    return gulp.src(path.src.js, { allowEmpty: true })
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({ stream: true }));
});

gulp.task('style:build', () => {
    return gulp.src(path.src.style)
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
        .pipe(reload({ stream: true }))

});

gulp.task('image:build', () => {
    return gulp.src(path.src.img, { allowEmpty: true })
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
        .pipe(reload({ stream: true }));
});

gulp.task('fonts:build', () => {
    return gulp.src(path.src.fonts, { allowEmpty: true })
        .pipe(gulp.dest(path.build.fonts))
});
gulp.task('revision', () => {
    return gulp
        .src(['./build/static/**/*.css', './build/static/**/*.js'])
        .pipe(rev())
        .pipe(gulp.dest('./build/static'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./build/static'))
})
gulp.task('revisionReplace', () => {
    var manifest = gulp.src('./build/static/rev-manifest.json')
    return gulp
        .src('./build/*.html')
        .pipe(revReplace({ manifest: manifest }))
        .pipe(gulp.dest('./build'))
})
gulp.task('build', gulp.series(
    'clean',
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build',
    'revision',
    'revisionReplace'

)
)

gulp.task('dev', gulp.series(
    'clean',
    gulp.parallel(
        'html:build',
        'js:build',
        'style:build',
        'fonts:build',
        'image:build'
    )
));

gulp.task('watch', () => {
    watch(path.watch.html, gulp.parallel("html:build"));
    watch(path.watch.style, gulp.parallel("style:build"));
    watch(path.watch.js, gulp.parallel("js:build"));
    watch(path.watch.img, gulp.parallel("image:build"));
    watch(path.watch.fonts, gulp.parallel("fonts:build"));
});

gulp.task('default', gulp.parallel('dev', 'webserver', 'watch'));