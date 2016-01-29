/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var fs     = require('fs'),
    path   = require('path'),
    util   = require('util'),
    sass   = require('node-sass'),
    del    = require('del'),
    loader = require('spa-component/lib/loader'),
    cache  = require('./lib/cache').cache,
    Plugin = require('spa-gulp/lib/plugin'),
    plugin = new Plugin({name: 'sass', entry: 'build', context: module}),
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
        files  = [data.sass.outFile],
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
        if ( error ) {
            return callback(error);
        }

        try {
            // css
            fs.writeFileSync(data.sass.outFile, result.css);
            // map
            if ( data.sass.sourceMap && result.map ) {
                fs.writeFileSync(data.sass.sourceMap, result.map);
                files.push(data.sass.sourceMap);
            }

            callback(null, files);
        } catch ( error ) {
            callback(error);
        }
    });
};


// create tasks for profiles
plugin.profiles.forEach(function ( profile ) {
    // add source data
    //plugin.prepare(profile.name);

    profile.watch(
        // main entry task
        profile.task(plugin.entry, function ( done ) {
            plugin.build(profile.name, function ( error, result ) {
                if ( error ) {
                    profile.notify({
                        type: 'fail',
                        info: error.formatted,
                        title: plugin.entry,
                        message: [path.relative(cwd, error.file) + ' ' + error.line + ':' + error.column, '', error.message]
                    });
                } else {
                    profile.notify({
                        info: result.map(function ( item ) {
                            return 'write '.green + item.bold;
                        }),
                        title: plugin.entry,
                        message: result
                    });
                }

                done();
            });
        })
    );

    // generate profile cache file
    profile.task('cache', function ( done ) {
        var file = path.join(profile.data.cache, profile.name + '.scss');

        fs.writeFile(
            file,
            cache({
                path:    profile.data.cache,
                prefix:  'spa',
                target:  profile.name,
                develop: profile.data.develop
            }),
            function ( error ) {
                if ( error ) {
                    profile.notify({
                        type: 'fail',
                        title: 'cache',
                        message: error.message
                    });
                } else {
                    profile.notify({
                        info: 'write '.green + file,
                        title: 'cache',
                        message: file
                    });
                }

                done();
            }
        );
    });

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
                    return 'delete '.green + path.relative(process.cwd(), item).bold;
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
