/**
 * Configuration for sass gulp task.
 *
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var path   = require('path'),
    extend = require('extend'),
    config = require('spa-gulp/config');


// base config
// each profile inherits all options from the "default" profile
module.exports = extend(true, {}, config, {
    default: {
        // directory to look for source files
        sourcePath: path.join(config.default.sourcePath, 'sass'),

        // main source entry point
        sourceFile: 'main.scss',

        // directory to store output files
        targetPath: path.join(config.default.targetPath, 'css'),

        // intended output file name
        targetFile: 'release.css',

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

        // create watch task
        // to automatically rebuild on source files change
        watch: false
    },

    develop: {
        targetFile: 'develop.css',

        outputStyle: 'nested',

        sourceMap: 'develop.map',

        watch: true
    }
});
