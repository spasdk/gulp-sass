/**
 * Configuration for sass gulp task.
 *
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var path   = require('path'),
    extend = require('extend'),
    config = require('spa-gulp/config'),
    entry  = path.join(config.default.source, 'sass', 'main.scss');


// base config
// each profile inherits all options from the "default" profile
module.exports = extend(true, {}, config, {
    default: {
        // main entry point
        source: [
            'spa-app',
            'spa-component',
            'spa-component-*',
            entry
        ],

        // intended output file
        target: path.join(config.default.target, 'css', 'release.css'),

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
                info: {
                    icon: path.join(__dirname, 'media', 'info.png')
                },
                warn: {
                    icon: path.join(__dirname, 'media', 'warn.png')
                },
                fail: {
                    icon: path.join(__dirname, 'media', 'fail.png')
                }
            }
        }
    },

    develop: {
        source: [
            'spa-app',
            'spa-component',
            'spa-component-*',
            'spa-develop',
            entry
        ],

        target: path.join(config.default.target, 'css', 'develop.css'),

        outputStyle: 'nested',

        sourceMap: path.join(config.default.target, 'css', 'develop.map'),

        watch: [
            path.join(config.default.source, 'sass', '**', '*.scss')
        ]
    }
});
