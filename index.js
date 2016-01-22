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
    Plugin = require('spa-gulp/lib/plugin'),
    plugin = new Plugin({name: 'sass', entry: 'build', context: module}),
    cwd    = process.cwd();


// rework profile
plugin.prepare = function ( name ) {
    var profile = this.config[name],
        files   = loader.load('-component-');

    files.unshift(path.join('node_modules', 'spa-app', 'sass', 'main.scss'));
    files.push(path.join('node_modules', 'spa-develop', 'sass', 'main.scss'));
    files.push(profile.source);

    console.log();

    profile.data = [];
    profile.data.push(util.format('@import "%s";', path.join('node_modules', 'spa-app', 'sass', 'main.scss')));
    //profile.data.push(util.format('@import "%s";', path.join('node_modules', 'spa-component', 'sass', 'main.scss')));
    //profile.data.push(util.format('@import "%s";', path.join('node_modules', 'spa-component-page', 'sass', 'main.scss')));
    profile.data.push(util.format('@import "%s";', path.join('node_modules', 'spa-develop', 'sass', 'main.scss')));
    profile.data.push(util.format('@import "%s";', profile.source));
};


// generate output file from profile
plugin.build = function ( name, callback ) {
    var data   = this.config[name],
        files  = [data.target],
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
            files.push(config.sourceMap);
        } else {
            // inline
            config.sourceMapEmbed = true;
        }
    }

    // do the magic
    sass.render(config, function ( error, result ) {
        if ( error ) {
            return callback(error);
        }

        try {
            // css
            fs.writeFileSync(config.outFile, result.css);
            // map
            if ( config.sourceMap && result.map ) {
                fs.writeFileSync(config.sourceMap, result.map);
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
    plugin.prepare(profile.name);

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
