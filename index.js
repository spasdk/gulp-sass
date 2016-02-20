/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var fs     = require('fs'),
    path   = require('path'),
    util   = require('util'),
    sass   = require('node-sass'),
    async  = require('cjs-async'),
    //loader = require('spa-component/lib/loader'),
    cache  = require('./lib/cache'),
    Plugin = require('spasdk/lib/plugin'),
    plugin = new Plugin({name: 'sass', entry: 'build', config: require('./config')}),
    cwd    = process.cwd();


// rework profile
plugin.prepare = function ( name ) {
    var profile = this.config[name],
        files   = loader.load('-component-');

    files.unshift(path.join('spa-app', 'sass', 'main.scss'));
    files.unshift(path.join('spa-app', 'sass', 'vars', 'default.scss'));
    files.push(path.join('spa-develop', 'sass', 'vars', 'default.scss'));
    files.push(path.join('spa-develop', 'sass', 'main.scss'));
    //files.push(profile.source);

    //console.log(files);

    profile.data = [];
    files = [profile.source];
    files.forEach(function ( file ) {
        profile.data.push(util.format('@import "%s";', file));
    });
    //profile.data.push(util.format('@import "%s";', path.join('node_modules', 'spa-app', 'sass', 'main.scss')));
    //profile.data.push(util.format('@import "%s";', path.join('node_modules', 'spa-component', 'sass', 'main.scss')));
    //profile.data.push(util.format('@import "%s";', path.join('node_modules', 'spa-component-page', 'sass', 'main.scss')));
    //profile.data.push(util.format('@import "%s";', path.join('node_modules', 'spa-develop', 'sass', 'main.scss')));
    //profile.data.push(util.format('@import "%s";', profile.source));
};


// generate output file from profile
plugin.build = function ( name, callback ) {
    var data   = this.config[name],
        config = {};

    /*
    // intended location of the output file
    config.outFile = data.target;

    // array of paths that used to resolve @import declarations
    config.includePaths = [cwd, path.join(cwd, 'node_modules')];

    // inherit options
    config.data              = data.data.join('\n');
    //config.indentType        = data.indentType;
    //config.indentWidth       = data.indentWidth;
    //config.linefeed          = data.lineBreak;
    //config.outputStyle       = data.outputStyle;
    //config.precision         = data.precision;
    //config.sourceComments    = data.sourceComments    || false;
    //config.sourceMapContents = data.sourceMapContents || false;

    // disable by default
    config.sourceMapEmbed = false;

    if ( data.sourceMap ) {
        // file or inline
        if ( typeof data.sourceMap === 'string' ) {
            // source map file name
            config.sourceMap = data.sourceMap;
            files.push(config.sourceMap);
        } else {
            // inline
            config.sourceMapEmbed = true;
        }
    }/**/

    // do the magic
    sass.render(data.sass, function ( error, result ) {
        var tasks = [];

        if ( error ) {
            return callback(error);
        }

        // to save css
        tasks.push(function ( done ) {
            fs.writeFile(data.sass.outFile, result.css, function ( error ) {
                done(error, path.relative(cwd, data.sass.outFile));
            });
        });

        // to save map
        if ( data.sass.sourceMap && result.map ) {
            tasks.push(function ( done ) {
                fs.writeFile(data.sass.sourceMap, result.map, function ( error ) {
                    done(error, path.relative(cwd, data.sass.sourceMap));
                });
            });
        }

        // save files
        async.parallel(tasks, callback);
    });
};


// create tasks for profiles
plugin.profiles.forEach(function ( profile ) {
    // add source data
    //plugin.prepare(profile.name);

    profile.watch('scss', profile.data.watch.scss,
        // main entry task
        profile.task(plugin.entry, function ( done ) {
            plugin.build(profile.name, function ( error, result ) {
                if ( error ) {
                    profile.notify({
                        type: 'fail',
                        info: error.formatted,
                        title: plugin.entry,
                        message: path.relative(cwd, error.file) + ' ' + error.line + ':' + error.column + ' ' + error.message
                    });
                } else {
                    result.forEach(function ( file ) {
                        profile.notify({
                            title: plugin.entry,
                            message: 'write ' + file
                        });
                    });
                }

                done();
            });
        })
    );

    profile.watch('cache', profile.data.watch.cache,
        // generate profile cache file
        profile.task('cache', function ( done ) {
            var file = path.join(profile.data.cache, profile.name + '.scss');

            //console.log(profile.data.variables);

            fs.mkdir(profile.data.cache, function () {
                fs.writeFile(
                    file,
                    util.format('$DEVELOP: %s;\n\n', profile.data.variables.DEVELOP) +
                    cache(/*{
                        path:    profile.data.cache,
                        prefix:  'spa',
                        target:  profile.name,
                        develop: profile.data.develop
                    }*/profile.data) + '\n',
                    function ( error ) {
                        if ( error ) {
                            profile.notify({
                                type: 'fail',
                                title: 'cache',
                                message: error.message
                            });
                        } else {
                            profile.notify({
                                title: 'cache',
                                message: 'write ' + file
                            });
                        }

                        done();
                    }
                );
            });
        })
    );

    // remove the generated file
    profile.task('clean', function ( done ) {
        var files = [profile.data.sass.outFile];

        if ( typeof profile.data.sass.sourceMap === 'string' ) {
            files.push(profile.data.sass.sourceMap);
        }

        // remove files
        async.parallel(files.map(function ( file ) {
            return function ( ready ) {
                fs.unlink(file, function ( error ) {
                    profile.notify({
                        type: error ? 'warn' : 'info',
                        title: 'clean',
                        message: error ? error : 'delete ' + file
                    });
                });

                ready();
            };
        }), done);
    });
});


// public
module.exports = plugin;
