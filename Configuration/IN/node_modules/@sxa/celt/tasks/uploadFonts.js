const gulp = require('gulp');
//
const config = require(global.rootPath + '/gulp/config');
const { fileActionResolver } = require('../util/fileActionResolver');

module.exports = function uploadFonts() {
    const promises = [];
    var conf = config.fonts;
    return gulp.src(conf.path)
        .on('data', function (_file) {
            let file = _file;
            file.event = 'change';
                promises.push(() => fileActionResolver(file));
        })
        .on('end', async () => {
            for (const prom of promises) {
                await prom();
            }
        })
};