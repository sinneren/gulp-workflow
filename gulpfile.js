/**
 * Modified by Sinneren on 12-10-2016.
 */
var gulp = require('gulp'),
    jade = require('gulp-jade'),

    browserify = require('browserify'),
    //babelify = require('babelify'),

    source = require('vinyl-source-stream'),
    uglify = require('gulp-uglify'),
    streamify = require('gulp-streamify'),

    sass = require('gulp-sass'),
    connect = require('gulp-connect'),
    concat      = require('gulp-concat'),
    postcss = require('gulp-postcss'),
    csswring = require('csswring'),
    base64 = require('postcss-base64'),
    mqpacker = require('css-mqpacker'),
    cssnext = require('postcss-cssnext'),
    lost = require('lost'),
    imagemin = require("gulp-imagemin"),
    plumber = require('gulp-plumber'),
    gulpif = require('gulp-if');

//Setting environment variable.
var env = process.env.NODE_ENV || 'development';

//Setting build / Output Directory
var outputDir = 'builds/development';

//HTML Task
//Transform Jade template to HTML template
gulp.task('jade', function() {
    return gulp.src('src/templates/**/*.jade')
        .pipe(plumber())
        .pipe(jade({pretty: true}))
        .pipe(gulp.dest(outputDir + '/views'))
        .pipe(connect.reload());
});

//JavaScript Task
//Browserify to bundle JS
//Babelify to transform from ES6 to browser readable JS
//Uglify to minify the JS files
gulp.task('scripts', function()  {
    return gulp.src(['bower_components/jquery/dist/jquery.min.js',
        'bower_components/Swiper/dist/js/swiper.jquery.min.js'])
        .pipe(plumber())
        .pipe(concat('vendors.min.js'))
        .pipe(gulp.dest(outputDir + '/js'))
        .pipe(connect.reload());
});

gulp.task('js', function()  {
    return gulp.src('src/js/App.js')
        .pipe(plumber())
        .pipe(streamify (gulpif (env === 'production', (uglify()))))
        .pipe(gulp.dest(outputDir + '/js'))
        .pipe(connect.reload());
});

gulp.task('sass', function()  {

    var config = {};

    if(env === 'development') {
        config.sourceComments = 'map';
    }

    if(env === 'production')  {
        config.outputStyle = 'compressed';
    }

    return gulp.src('src/sass/main.scss')
        .pipe(plumber())
        .pipe(sass(config))
        .pipe(gulp.dest(outputDir + '/css'))
        .pipe(connect.reload());
});

//Styles task
//postCSS for postprocessor of CSS
//CSSNext for writing future CSS syntax
gulp.task('styles', function()  {

    var processors = [
        /*csswring,*/ //Use for compressing
        //autoprefixer({ browsers: ['last 4 versions'] }),
        cssnext({ browsers: ['> 5%', 'last 2 versions', 'Firefox ESR', 'IE 9'] }),
        base64({extensions: ['.svg']}),
        mqpacker(),
        lost
    ]

    return gulp.src(outputDir + '/css/main.css')
        .pipe(plumber())
        .pipe(postcss(processors))
        .pipe(gulp.dest(outputDir + '/css'))
        .pipe(connect.reload());
});

gulp.task('img', function () {
  return gulp.src('src/img/*')
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(outputDir + '/img'))
    .pipe(connect.reload());
});

//Watch Task
gulp.task('watch', function()  {
    gulp.watch('src/templates/**/*.jade', ['jade']);
    gulp.watch('src/sass/**/*.scss', ['sass']);
    gulp.watch(outputDir + '/css/**/*.css', ['styles']);
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/img/*', ['img']);
});

//Connect to listen to a port and reloading the browser with changes
gulp.task('connect', function()  {
    connect.server({
        root: [outputDir],
        port: '8022',
        livereload: true
    });
});

gulp.task('default', ['connect', 'img', 'jade', 'sass', 'styles', 'scripts', 'js', 'watch']);