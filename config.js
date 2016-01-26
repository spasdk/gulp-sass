/**
 * Base configuration for sass gulp task.
 *
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var path     = require('path'),
    extend   = require('extend'),
    config   = require('spa-gulp/config'),
    profiles = {};


// main
profiles.default = extend(true, {}, config, {
    // main entry point
    source: path.join(config.source, 'sass', 'main.scss'),

    // intended output file
    target: path.join(config.target, 'css', 'release.css'),

    resolution: ['default'],

    // output format of the final CSS style
    // options: nested, expanded, compact, compressed
    outputStyle: 'compressed',

    // whether to use space or tab character for indentation
    indentType: 'space',

    // the number of spaces or tabs to be used for indentation
    indentWidth: 4,

    // whether to use cr, crlf, lf or lfcr sequence for line break
    lineBreak: 'lf',

    // how many digits after the decimal will be allowed
    precision: 2,

    // additional debugging information in the output file as CSS comments
    sourceComments: false,

    // the writing location for the source map file
    // options: file name, true - inline source map, false - disable
    sourceMap: false,

    // whether to include the source files content in the source map
    // bigger map file but no need to serve source scss files
    sourceMapContents: false,

    // info channels
    notifications: {
        popup: {
            info: {icon: path.join(__dirname, 'media', 'info.png')},
            warn: {icon: path.join(__dirname, 'media', 'warn.png')},
            fail: {icon: path.join(__dirname, 'media', 'fail.png')}
        }
    }
});


profiles.develop = extend(true, {}, profiles.default, {
    // intended output file
    target: path.join(config.target, 'css', 'develop.css'),

    // output format of the final CSS style
    // options: nested, expanded, compact, compressed
    outputStyle: 'nested',

    // the writing location for the source map file
    // options: file name, true - inline source map, false - disable
    sourceMap: path.join(config.target, 'css', 'develop.map'),

    // false to prevent watch task creation
    // otherwise array of globs to monitor
    watch: [
        path.join(config.source, 'sass', '**', '*.scss')
    ]
});


// public
module.exports = profiles;
