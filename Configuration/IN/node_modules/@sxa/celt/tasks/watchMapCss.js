const gulp = require('gulp');
const vinyl = require('vinyl-file');
//
const config = require(global.rootPath + '/gulp/config');
const { fileActionResolver } = require('../util/fileActionResolver');


module.exports = function watchMapCss() {
    setTimeout(function () {
        console.log('Watching .map css files started...'.green);
    }, 0);
    var conf = config.map,
        mapCssPath = conf && conf.cssPath ? conf.cssPath : 'styles/**/*css.map',
        watch = gulp.watch(mapCssPath, { queue: true });
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