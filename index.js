/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var /*fs       = require('fs'),
    path     = require('path'),
    util     = require('util'),
    gulp     = require('gulp'),
    sass     = require('node-sass'),
    del      = require('del'),
    tools    = require('spa-gulp/tools'),
    gulpName = 'sass',
    //config   = tools.load(path.join(__dirname, 'config'), gulpName),
    config   = tools.config(module, gulpName),
    //pkgInfo  = require(process.env.PACKAGE),
    outFiles = [],
    taskList = [],
    tasks = {};*/

    fs     = require('fs'),
    path   = require('path'),
    util   = require('util'),
    sass   = require('node-sass'),
    del    = require('del'),
    Plugin = require('spa-gulp/lib/plugin'),
    plugin = new Plugin({name: 'sass', entry: 'build', context: module});


// rework profile
plugin.prepare = function ( name ) {
    var profile = this.config[name];

    profile.data = [];
    profile.data.push(util.format('@import "%s";', path.join('node_modules', 'spa-app', 'sass', 'main.scss')));
    profile.data.push(util.format('@import "%s";', path.join('node_modules', 'spa-component', 'sass', 'main.scss')));
    profile.data.push(util.format('@import "%s";', path.join('node_modules', 'spa-component-page', 'sass', 'main.scss')));
    profile.data.push(util.format('@import "%s";', path.join('node_modules', 'spa-develop', 'sass', 'main.scss')));
    profile.data.push(util.format('@import "%s";', profile.source));
};


// generate output file from profile
plugin.build = function ( name, callback ) {
    var data   = this.config[name],
        config = {};

    // intended location of the output file
    config.outFile = data.target;

    // array of paths that used to resolve @import declarations
    config.includePaths = [process.env.PATH_ROOT];

    // inherit options
    config.data              = data.data.join('\n');
    config.indentType        = data.indentType;
    config.indentWidth       = data.indentWidth;
    config.linefeed          = data.lineBreak;
    config.outputStyle       = data.outputStyle;
    config.precision         = data.precision;
    config.sourceComments    = data.sourceComments    || false;
    config.sourceMapContents = data.sourceMapContents || false;

    // disable by default
    config.sourceMapEmbed = false;

    if ( data.sourceMap ) {
        // file or inline
        if ( typeof data.sourceMap === 'string' ) {
            // source map file name
            config.sourceMap = data.sourceMap;
        } else {
            // inline
            config.sourceMapEmbed = true;
        }
    }

    // do the magic
    sass.render(config, function ( error, result ) {
        if ( error ) {
            // console log + notification popup
            //tools.error(gulpName, error.formatted.trim());
            return callback(error);
        }

        try {
            // css
            fs.writeFileSync(config.outFile, result.css);
            // map
            if ( config.sourceMap && result.map ) {
                fs.writeFileSync(config.sourceMap, result.map);
            }

            callback(null);
        } catch ( error ) {
            // console log + notification popup
            //tools.error(gulpName, error.message);
            callback(error);
        }
    });
};


// create tasks for profiles
plugin.profiles.forEach(function ( profile ) {
    // add source data
    plugin.prepare(profile.name);

    profile.watch(
        // main entry task
        profile.task(plugin.entry, function ( done ) {
            plugin.build(profile.name, function ( error ) {
                //var message;

                console.log(error);

                /*if ( error ) {
                    profile.notify({
                        type: 'fail',
                        info: error.message,
                        title: plugin.entry,
                        message: [message[0], '', message[message.length - 1]]
                    });
                } else {
                    profile.notify({
                        info: 'write '.green + profile.data.target,
                        title: plugin.entry,
                        message: profile.data.target
                    });
                }*/

                done();
            });
        })
    );

    // remove the generated file
    profile.task('clean', function () {
        var files = [profile.data.target];

        if ( typeof profile.data.sourceMap === 'string' ) {
            files.push(profile.data.sourceMap);
        }

        files = del.sync(files);

        if ( files.length ) {
            // something was removed
            profile.notify({
                info: files.map(function ( item ) {
                    return 'delete '.green + path.relative(process.cwd(), item);
                }),
                title: 'clean',
                message: files.map(function ( item ) {
                    return path.relative(process.cwd(), item);
                })
            });
        }
    });
});


// public
module.exports = plugin;


return;


function build ( profile, done ) {
    var config = {};

    // intended location of the output file
    config.outFile = profile.target;

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
            config.sourceMap = profile.sourceMap;
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


// task set was turned off in gulp.js
if ( !config ) {
    // do not create tasks
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
    data.push(util.format('@import "%s";', profile.source));

    profile.data = data.join('\n');

    // profile build task
    gulp.task(buildName, function ( done ) {
        build(profile, done);
    });

    // remove all generated html files
    gulp.task(cleanName, function () {
        var files = [];

        // protect from upper content deletion
        if ( profile.target ) {
            // files to delete in clear task
            files.push(profile.target);
        }

        // protect from upper content deletion
        if ( profile.sourceMap && typeof profile.sourceMap === 'string' ) {
            // files to delete in clear task
            files.push(profile.sourceMap);
        }

        tools.log('clean', del.sync(files));
    });

    // profile watch task
    if ( profile.watch ) {
        // done callback should be present to show gulp that task is not over
        gulp.task(watchName, function ( done ) {
            gulp.watch([
                //process.env.PACKAGE,
                path.join(process.env.PATH_SRC, profile.source, '**', '*.scss')
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
//module.exports = {
//    compile: compile
//};
