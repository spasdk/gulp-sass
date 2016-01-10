/**
 * Compile CSS files from SASS sources.
 *
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var fs       = require('fs'),
    path     = require('path'),
    util     = require('util'),
    gulp     = require('gulp'),
    sass     = require('node-sass'),
    del      = require('del'),
    tools    = require('spa-gulp/tools'),
    gulpName = 'sass',
    config   = tools.load(path.join(process.env.PATH_ROOT, process.env.PATH_CFG, gulpName), path.join(__dirname, 'config')),
    pkgInfo  = require(process.env.PACKAGE),
    outFiles = [],
    taskList = []
    ;


function compile ( profile, done ) {
    var config = {};

    // intended location of the output file
    config.outFile = path.join(process.env.PATH_ROOT, process.env.PATH_APP, profile.targetPath, profile.targetFile);

    // array of paths that used to resolve @import declarations
    config.includePaths = [process.env.PATH_ROOT];

    // inherit options
    config.data              = profile.data;
    config.indentType        = profile.indentType;
    config.indentWidth       = profile.indentWidth;
    config.linefeed          = profile.lineBreak;
    config.outputStyle       = profile.outputStyle;
    config.precision         = profile.precision;
    config.sourceComments    = profile.sourceComments    || false;
    config.sourceMapContents = profile.sourceMapContents || false;

    // disable by default
    config.sourceMapEmbed = false;

    if ( profile.sourceMap ) {
        // file or inline
        if ( typeof profile.sourceMap === 'string' ) {
            // source map file name
            config.sourceMap = path.join(process.env.PATH_ROOT, process.env.PATH_APP, profile.targetPath, profile.sourceMap);
        } else {
            // inline
            config.sourceMapEmbed = true;
        }
    }

    // do the magic
    sass.render(config, function ( error, result ) {
        if ( error ) {
            // console log + notification popup
            tools.error(gulpName, error.formatted.trim());
        } else {
            try {
                // css
                fs.writeFileSync(config.outFile, result.css);
                // map
                if ( config.sourceMap && result.map ) {
                    fs.writeFileSync(config.sourceMap, result.map);
                }
            } catch ( error ) {
                // console log + notification popup
                tools.error(gulpName, error.message);
            }
        }

        done();
    });
}


// do not create tasks
if ( !config.active ) {
    return;
}


// build global task tree
//global.tasks.build[gulpName] = [];
//global.tasks.watch[gulpName] = [];
//global.tasks.clean[gulpName] = [];
//global.tasks[gulpName] = {
//    build: [],
//    watch: [],
//    clean: []
//};
global.tasks[gulpName] = [gulpName + ':build'];
global.tasks[gulpName + ':build'] = [];
global.tasks[gulpName + ':watch'] = [];
global.tasks[gulpName + ':clean'] = [];
global.tasks.build.push(gulpName + ':build');
global.tasks.watch.push(gulpName + ':watch');
global.tasks.clean.push(gulpName + ':clean');


// only derived profiles are necessary
delete config.profiles.default;


// generate tasks by config profiles
Object.keys(config.profiles).forEach(function ( profileName ) {
    var profile   = config.profiles[profileName],
        buildName = gulpName + ':build:' + profileName,
        watchName = gulpName + ':watch:' + profileName,
        cleanName = gulpName + ':clean:' + profileName,
        data      = [];

    data.push(util.format('@import "%s";', path.join('node_modules', 'spa-app', 'sass', 'main.scss')));
    data.push(util.format('@import "%s";', path.join('node_modules', 'spa-component', 'sass', 'main.scss')));
    data.push(util.format('@import "%s";', path.join('node_modules', 'spa-component-page', 'sass', 'main.scss')));
    data.push(util.format('@import "%s";', path.join('node_modules', 'spa-develop', 'sass', 'main.scss')));
    data.push(util.format('@import "%s";', path.join(process.env.PATH_SRC, profile.sourcePath, profile.sourceFile)));

    profile.data = data.join('\n');

    // profile build task
    gulp.task(buildName, function ( done ) {
        compile(profile, done);
    });

    // remove all generated html files
    gulp.task(cleanName, function () {
        var files = [];

        // protect from upper content deletion
        if ( profile.targetFile ) {
            // files to delete in clear task
            files.push(path.join(process.env.PATH_APP, profile.targetPath || '', profile.targetFile));
        }

        // protect from upper content deletion
        if ( profile.sourceMap && typeof profile.sourceMap === 'string' ) {
            // files to delete in clear task
            files.push(path.join(process.env.PATH_APP, profile.targetPath || '', profile.sourceMap));
        }

        tools.log('clean', del.sync(files));
    });

    // profile watch task
    if ( profile.watch ) {
        // done callback should be present to show gulp that task is not over
        gulp.task(watchName, function ( done ) {
            gulp.watch([
                //process.env.PACKAGE,
                path.join(process.env.PATH_SRC, profile.sourcePath, '**', '*.scss')
            ], [buildName]);
        });

        // register global tasks
        //global.tasks.watch[gulpName].push(watchName);
        //global.tasks[gulpName].watch.push(watchName);
        global.tasks[gulpName + ':watch'].push(watchName);
    }

    // register global tasks
    //global.tasks.build[gulpName].push(buildName);
    //global.tasks.clean[gulpName].push(cleanName);
    //global.tasks[gulpName].build.push(buildName);
    //global.tasks[gulpName].clean.push(cleanName);
    global.tasks[gulpName + ':build'].push(buildName);
    global.tasks[gulpName + ':clean'].push(cleanName);

    global.tasks['build:' + profileName] = global.tasks['build:' + profileName] || [];
    global.tasks['build:' + profileName].push(buildName);

    global.tasks['clean:' + profileName] = global.tasks['clean:' + profileName] || [];
    global.tasks['clean:' + profileName].push(cleanName);
});


/*gulp.task('sass:develop', function ( done ) {
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
});*/


// output current config
gulp.task(gulpName + ':config', function () {
    tools.log(gulpName, util.inspect(config, {depth: 5, colors: true}));
});


//// remove all generated html files
//gulp.task(gulpName + ':clean', function () {
//    tools.log('clean', del.sync(outFiles));
//});
//
//// register in global task "clean"
//global.tasks.clean.push(gulpName + ':clean');
//
//
//// run all profiles tasks
//gulp.task(gulpName, taskList);


// public
module.exports = {
    compile: compile
};
