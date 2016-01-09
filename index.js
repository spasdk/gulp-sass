/**
 * Compile CSS files from SASS sources.
 *
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var fs   = require('fs'),
    path = require('path'),
    util = require('util'),
    gulp = require('gulp'),
    log  = require('gulp-util').log,
    sass = require('node-sass'),
//load = require('require-nocache')(module),
    del  = require('del'),
    load    = require('../lib/load'),
    config  = load('sass'),
    cfg  = path.join(process.env.PATH_ROOT, process.env.PATH_CFG, 'sass'),
    outFiles = [],
    profileTasks = [];


function compile ( config, mode, done ) {
    var options = config[mode];

    // intended location of the output file
    options.outFile = path.join(process.env.PATH_ROOT, process.env.PATH_APP, config.path, options.outFile);

    // array of paths that used to resolve @import declarations
    options.includePaths = [process.env.PATH_ROOT];

    // disable by default
    options.sourceMapEmbed = false;

    if ( options.sourceMap ) {
        // file or inline
        if ( typeof options.sourceMap === 'string' ) {
            // source map file name
            options.sourceMap = path.join(process.env.PATH_ROOT, process.env.PATH_APP, config.path, options.sourceMap);
        } else {
            // inline
            options.sourceMapEmbed = true;
        }
    }

    // do the magic
    sass.render(options, function ( error, result ) {
        //var notifier = require('node-notifier');

        if ( error ) {
            // make nice output
            error.formatted.trim().split('\n').forEach(function ( line ) {
                log('sass    '.bgRed, line.reset);
            });

            //console.log(error);

            //notifier.notify({
            //    icon: '/home/dp/Downloads/error.png',
            //    title: 'sass gulp task',
            //    message: error.message + '\n\n' + error.file + ' ' + error.line + ':' + error.column
            //});

            done();
        } else {
            fs.writeFile(options.outFile, result.css, function () {
                if ( options.sourceMap && result.map ) {
                    fs.writeFile(options.sourceMap, result.map, function () {
                        done();
                    });
                } else {
                    done();
                }
            });
        }
    });
}


// do not create tasks
if ( !config.active ) {
    return;
}


// only derived profiles are necessary
delete config.profiles.default;


gulp.task('sass:develop', function ( done ) {
    var //pkgInfo = load(process.env.PACKAGE),
        config = load(cfg),
        data   = [];

    data.push(util.format('@import "%s";', path.join('node_modules', 'spa-app', 'sass', 'main.scss')));
    data.push(util.format('@import "%s";', path.join('node_modules', 'spa-component', 'sass', 'main.scss')));
    data.push(util.format('@import "%s";', path.join('node_modules', 'spa-component-page', 'sass', 'main.scss')));
    data.push(util.format('@import "%s";', path.join('node_modules', 'spa-develop', 'sass', 'main.scss')));
    data.push(util.format('@import "%s";', path.join(process.env.PATH_SRC, 'sass', 'main.scss')));

    config.develop.data = data.join('\n');

    compile(config, 'develop', done);
});


gulp.task('sass:release', function ( done ) {
    var //pkgInfo = load(process.env.PACKAGE),
        config = load(cfg),
        data   = [];

    data.push(util.format('@import "%s";', path.join('node_modules', 'spa-app', 'sass', 'main.scss')));
    data.push(util.format('@import "%s";', path.join('node_modules', 'spa-component', 'sass', 'main.scss')));
    data.push(util.format('@import "%s";', path.join('node_modules', 'spa-component-page', 'sass', 'main.scss')));
    data.push(util.format('@import "%s";', path.join(process.env.PATH_SRC, 'sass', 'main.scss')));

    config.release.data = data.join('\n');

    compile(config, 'release', done);
});


/*var packages = {};

 function scan ( dependencies ) {
 dependencies = Object.keys(dependencies || {});

 dependencies.forEach(function ( name ) {
 var pkgInfo = load(path.join(process.env.PATH_ROOT, 'node_modules', name, 'package.json'));

 if ( !(name in packages) ) {
 packages[name] = pkgInfo.dependencies;
 console.log(pkgInfo.name);
 scan(pkgInfo.dependencies);
 }
 });
 }


 gulp.task('sass:scan', function () {
 var pkgInfo = load(process.env.PACKAGE);

 console.log(scan(pkgInfo.dependencies));
 });*/


// output current config
gulp.task('sass:config', function () {
    console.log(util.inspect(config, {depth: 5, colors: true}));
});


// remove all generated html files
gulp.task('sass:clean', function () {
    del.sync(outFiles);
});


// run all profiles tasks
gulp.task('sass', profileTasks);


// public
module.exports = {
    compile: compile
};
