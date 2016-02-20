/**
 * Components loading.
 *
 * @author Stanislav Kalashnik <darkpark.main@gmail.com>
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var fs      = require('fs'),
    util    = require('util'),
    path    = require('path'),
    cwd     = process.cwd(),
    pkgInfo = require(path.join(cwd, 'package.json'));


function normalize ( paths ) {
    var result = {};

    paths.forEach(function ( item ) {
        if ( item.indexOf('node_modules') !== -1 ) {
            item = path.join(path.dirname(item), 'sass');

            if ( fs.existsSync(item) ) {
                result[item] = true;
            }
        }
    });

    return Object.keys(result).sort();
}


// public
module.exports = function ( profile ) {
    var srcVars = [],
        srcMain = [],
        modules = path.join(path.relative(profile.path || '', cwd), 'node_modules');


    //console.log(profile.jsCache);
    //console.log(normalize(JSON.parse(fs.readFileSync(profile.jsCache))));
    normalize(JSON.parse(fs.readFileSync(profile.jsCache))).forEach(function ( item ) {
        srcVars.push(path.join('..', '..', '..', item, profile.varsFile));
        srcMain.push(path.join('..', '..', '..', item, profile.mainFile));
    });


    //srcVars.push(path.join(modules, profile.prefix + '-app', 'sass', 'vars', profile.target + '.scss'));
    //srcMain.push(path.join(modules, profile.prefix + '-app', 'sass', 'main.scss'));
	//
    //srcVars.push(path.join(modules, profile.prefix + '-component', 'sass', 'vars', profile.target + '.scss'));
    //srcMain.push(path.join(modules, profile.prefix + '-component', 'sass', 'main.scss'));
	//
    //// components
    //Object.keys(pkgInfo.dependencies).concat(Object.keys(pkgInfo.devDependencies || {})).forEach(function ( name ) {
    //    // get only gulp task packages
    //    if ( name.indexOf('-component-') !== -1 ) {
    //        srcVars.push(path.join(modules, name, 'sass', 'vars', profile.target + '.scss'));
    //        srcMain.push(path.join(modules, name, 'sass', 'main.scss'));
    //    }
    //});
	//
    ////if ( config.develop ) {
    ////    srcVars.push(path.join(modules, config.prefix + '-develop', 'sass', 'vars', config.target + '.scss'));
    ////    srcMain.push(path.join(modules, config.prefix + '-develop', 'sass', 'main.scss'));
    ////}

    // todo: path ".." can differ
    srcVars.push(path.join('..', 'vars.scss'));
    srcMain.push(path.join('..', 'main.scss'));

    // put everything together
    return srcVars.concat(srcMain).map(function ( item ) {
        return util.format('@import "%s";', item);
    }).join('\n');

    //var files = [
    //        path.join('spa-component', 'sass', 'vars', resolution + '.scss'),
    //        path.join('spa-component', 'sass', 'main.scss')
    //    ],
    //    names = Object.keys(pkgInfo.dependencies).concat(Object.keys(pkgInfo.devDependencies || {}));
    //
    //names.forEach(function ( name ) {
    //    // get only gulp task packages
    //    if ( name.indexOf(prefix) !== -1 ) {
    //        //extend(true, files, require(name).tasks);
    //        files.push(path.join(name, 'sass', 'vars', resolution + '.scss'));
    //        files.push(path.join(name, 'sass', 'main.scss'));
    //    }
    //});
    //
    //return files;
};

//
//// public
//module.exports = {
//    // config.develop
//    // config.target
//    // config.prefix
//    // config.path
//    cache: function ( config ) {
//        var srcVars = [],
//            srcMain = [],
//            modules = path.join(path.relative(config.path, cwd), 'node_modules');
//
//        srcVars.push(path.join(modules, config.prefix + '-app', 'sass', 'vars', config.target + '.scss'));
//        srcMain.push(path.join(modules, config.prefix + '-app', 'sass', 'main.scss'));
//
//        srcVars.push(path.join(modules, config.prefix + '-component', 'sass', 'vars', config.target + '.scss'));
//        srcMain.push(path.join(modules, config.prefix + '-component', 'sass', 'main.scss'));
//
//        // components
//        Object.keys(pkgInfo.dependencies).concat(Object.keys(pkgInfo.devDependencies || {})).forEach(function ( name ) {
//            // get only gulp task packages
//            if ( name.indexOf('-component-') !== -1 ) {
//                srcVars.push(path.join(modules, name, 'sass', 'vars', config.target + '.scss'));
//                srcMain.push(path.join(modules, name, 'sass', 'main.scss'));
//            }
//        });
//
//        //if ( config.develop ) {
//        //    srcVars.push(path.join(modules, config.prefix + '-develop', 'sass', 'vars', config.target + '.scss'));
//        //    srcMain.push(path.join(modules, config.prefix + '-develop', 'sass', 'main.scss'));
//        //}
//
//        // todo: path ".." can differ
//        srcVars.push(path.join('..', 'vars', config.target + '.scss'));
//        srcMain.push(path.join('..', 'main.scss'));
//
//        // put everything together
//        return srcVars.concat(srcMain).map(function ( item ) {
//            return util.format('@import "%s";', item);
//        }).join('\n');
//
//        //var files = [
//        //        path.join('spa-component', 'sass', 'vars', resolution + '.scss'),
//        //        path.join('spa-component', 'sass', 'main.scss')
//        //    ],
//        //    names = Object.keys(pkgInfo.dependencies).concat(Object.keys(pkgInfo.devDependencies || {}));
//		//
//        //names.forEach(function ( name ) {
//        //    // get only gulp task packages
//        //    if ( name.indexOf(prefix) !== -1 ) {
//        //        //extend(true, files, require(name).tasks);
//        //        files.push(path.join(name, 'sass', 'vars', resolution + '.scss'));
//        //        files.push(path.join(name, 'sass', 'main.scss'));
//        //    }
//        //});
//		//
//        //return files;
//    }
//};
