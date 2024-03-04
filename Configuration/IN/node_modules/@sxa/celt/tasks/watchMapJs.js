const gulp = require('gulp');
const vinyl = require('vinyl-file');
//
const config = require(global.rootPath + '/gulp/config');
const { fileActionResolver } = require('../util/fileActionResolver');


module.exports = function watchMapJs() {
    setTimeout(function () {
        console.log('Watching .map js files started...'.green);
    }, 0);
    var conf = config.map,
        mapJsPath = conf && conf.jsPath ? conf.jsPath : 'scripts/**/*js.map',
        watch = gulp.watch(mapJsPath, { queue: true });
    watch.on('all', function (event, path) {
        var file = {
            path: path
        };
        if (event !== 'unlink') {
            file = vinyl.readSync(path);
        }

        file.event = event;
        fileActionResolver(file);
    })
};