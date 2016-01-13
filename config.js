/**
 * Configuration for sass gulp task.
 *
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

// public
module.exports = {
    // set of named configs for corresponding gulp tasks
    // each profile inherits all options from the "default" profile
    profiles: {
        // config to be extended by other profiles
        default: {
            // directory to look for source files
            // default: <project root>/src/sass
            sourcePath: 'sass',

            // main source entry point
            sourceFile: 'main.scss',

            // directory to store output files
            // default: <project root>/app/css
            targetPath: 'css',

            // whether to use space or tab character for indentation
            indentType: 'space',

            // the number of spaces or tabs to be used for indentation
            indentWidth: 4,

            // whether to use cr, crlf, lf or lfcr sequence for line break
            lineBreak: 'lf',

            // how many digits after the decimal will be allowed
            precision: 2
        },

        // config for sass:build:develop task
        develop: {
            // intended output file name
            targetFile: 'develop.css',

            // output format of the final CSS style
            // options: nested, expanded, compact, compressed
            outputStyle: 'nested',

            // additional debugging information in the output file as CSS comments
            sourceComments: false,

            // the writing location for the source map file
            // options: file name, true - inline source map, false - disable
            sourceMap: 'develop.map',

            // whether to include the source files content in the source map
            // bigger map file but no need to serve source scss files
            sourceMapContents: false,

            // create task sass:watch:develop
            // to automatically rebuild on source files change
            watch: true
        },

        // config for sass:build:release task
        release: {
            // intended output file name
            targetFile: 'release.css',

            // output format of the final CSS style
            // options: nested, expanded, compact, compressed
            outputStyle: 'compressed'
        }
    }
};
