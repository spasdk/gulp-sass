/**
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var fs     = require('fs'),
    path   = require('path'),
    //util   = require('util'),
    sass   = require('node-sass'),
    async  = require('cjs-async'),
    //cache  = require('./cache'),
    PluginTemplate = require('spa-plugin'),
    cwd    = process.cwd();


/**
 * @constructor
 * @extends PluginTemplate
 *
 * @param {Object} config init parameters (all inherited from the parent)
 */
function Plugin ( config ) {
    var self = this;

    // parent constructor call
    PluginTemplate.call(this, config);

    // create tasks for profiles
    this.profiles.forEach(function ( profile ) {
        var buildTask = profile.task(self.entry, function ( done ) {
                self.build(profile.name, function ( error, result ) {
                    if ( error ) {
                        profile.notify({
                            type: 'fail',
                            info: error.formatted,
                            title: self.entry,
                            message: path.relative(cwd, error.file) + ' ' + error.line + ':' + error.column + ' ' + error.message
                        });
                    } else {
                        result.forEach(function ( file ) {
                            profile.notify({
                                title: self.entry,
                                info: 'write ' + file
                            });
                        });
                    }

                    done();
                });
            }),
            //cacheTask = profile.task('cache', function ( done ) {
            //    var file = path.join(profile.data.cache, profile.name + '.scss');
			//
            //    //console.log(profile.data.variables);
			//
            //    fs.mkdir(profile.data.cache, function () {
            //        fs.writeFile(
            //            file,
            //            util.format('$DEVELOP: %s;\n\n', profile.data.variables.DEVELOP) +
            //            cache(/*{
            //             path:    profile.data.cache,
            //             prefix:  'spa',
            //             target:  profile.name,
            //             develop: profile.data.develop
            //             }*/profile.data) + '\n',
            //            function ( error ) {
            //                if ( error ) {
            //                    profile.notify({
            //                        type: 'fail',
            //                        title: 'cache',
            //                        info: 'write ' + file,
            //                        message: error.message
            //                    });
            //                } else {
            //                    profile.notify({
            //                        title: 'cache',
            //                        info: 'write ' + file
            //                    });
            //                }
			//
            //                done();
            //            }
            //        );
            //    });
            //}),
            watcher/*, cacheWatcher*/;

        if ( profile.data.watch ) {
            // rebuild on files change
            profile.task('watch', function ( done ) {
                watcher = self.watch(profile.data.watch, buildTask);
                watcher.done = done;
            });

            // stop watching
            profile.task('unwatch', function () {
                if ( watcher ) {
                    // finish chokidar
                    watcher.close();
                    // complete the initial task
                    watcher.done();
                    // clear
                    watcher = null;
                }
            });
        }

        //if ( profile.data.watch && profile.data.watch.cache ) {
        //    // rebuild on files change
        //    profile.task('cache:watch', function ( done ) {
        //        cacheWatcher = self.watch(profile.data.watch.cache, cacheTask);
        //        cacheWatcher.done = done;
        //    });
		//
        //    // stop watching
        //    profile.task('cache:unwatch', function () {
        //        if ( cacheWatcher ) {
        //            // finish chokidar
        //            cacheWatcher.close();
        //            // complete the initial task
        //            cacheWatcher.done();
        //            // clear
        //            cacheWatcher = null;
        //        }
        //    });
        //}

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
                            info: 'delete ' + file,
                            message: error ? error.message : ''
                        });
                    });

                    ready();
                };
            }), done);
        });
    });

    this.debug('tasks: ' + Object.keys(this.tasks).sort().join(', '));
}


// inheritance
Plugin.prototype = Object.create(PluginTemplate.prototype);
Plugin.prototype.constructor = Plugin;


// generate output file from profile
Plugin.prototype.build = function ( name, callback ) {
    var data   = this.config[name];

    // do the magic
    sass.render(data.sass, function ( error, result ) {
        var tasks = [];

        if ( error ) {
            callback(error);
        } else {
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
        }
    });
};


// public
module.exports = Plugin;
