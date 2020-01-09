'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var chokidar = require('chokidar');
var chalk = require('chalk');
var shell = require('shelljs');
var minimist = require('minimist');
var dargs = require('dargs');
var path = require('path');
var WATCH_DIR = '.';
var watcher = chokidar.watch(WATCH_DIR, {
    ignored: ['**/node_modules/**', '**/.git/**', '**/_templates/**', '**/__tests__/**', '**/.nuxt/**'],
    ignoreInitial: true,
    persistent: true
});
function doTheWork(path, argv) {
    var _a = parseFilePath(path), pathToFile = _a.pathToFile, fileNameWithExtension = _a.fileNameWithExtension, fileName = _a.fileName, fileExtension = _a.fileExtension;
    // pause watching for new files in order to prevent recursion 
    // because now we will create new files by hygen
    watcher.unwatch('*.*');
    var argsString = objToArguments(argv);
    Object.keys(argv).map(function (generator) {
        var generatorValue = argv[generator];
        if (typeof generatorValue === 'string' && path.includes(generatorValue)) {
            shell.exec("HYGEN_OVERWRITE=1 hygen " + generator + " new --fileNameWithExtension " + fileNameWithExtension + " --pathToFile " + pathToFile + " --fileName " + fileName + " --fileExtension " + fileExtension + " " + argsString);
        }
    });
    // after creating new files, start watch again
    watcher.add(WATCH_DIR);
}
function stripPath(p) {
    var pathToFile = p.replace(/\/[^\/]+$/, '');
    return pathToFile;
}
function parseFilePath(p) {
    return {
        pathToFile: stripPath(p),
        fileNameWithExtension: path.basename(p),
        fileName: path.basename(p).split('.')[0],
        fileExtension: path.basename(p).split('.').reverse()[0],
    };
}
function argsToObject(args) {
    return minimist(args.slice(2));
}
function objToArguments(obj) {
    return ' ' + dargs(obj).join(' ') + ' ';
}
function cli(args) {
    var argv = argsToObject(args);
    watcher.on('add', function (path) { return doTheWork(path, argv); });
}

exports.cli = cli;
