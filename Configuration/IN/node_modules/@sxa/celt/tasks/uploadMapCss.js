const gulp = require('gulp');
const tap = require('gulp-tap');
//
const config = require(global.rootPath + '/gulp/config');
const { fileActionResolver } = require('../util/fileActionResolver');

module.exports = function uploadCss() {
    var conf = config.map;
    const promises = [];

    return gulp.src(conf.cssPath)
        .pipe(tap(
            function (_file) {
                let file = _file;
                file.event = 'change';
                promises.push(() => fileActionResolver(file));
            })
        )
        .on('end', async () => {
            for (const prom of promises) {
                await prom();
            }
        })
};