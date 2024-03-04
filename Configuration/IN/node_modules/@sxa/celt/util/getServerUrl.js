const execa = require('execa');

module.exports = function getServerUrl() {
    const config = require(global.rootPath + '/gulp/config');
    let url = execa.commandSync(`sxa get-url`);
    url = url.stdout ? url.stdout : null;
    let serverUrl = global.serverUrl ? global.serverUrl : null
    let urlPromise = new Promise((resolve, reject) => {
        if (serverUrl) {
            return resolve(serverUrl)
        } else if (typeof config.serverUrlStrategy === 'undefined' || config.serverUrlStrategy == 'local' || url == null) {
            return resolve(config.serverOptions.server)
        } else if (config.serverUrlStrategy == 'global') {
            return resolve(url)
        } else {
            const errorResponse = 'Can`t resolve url. Check if serverUrlStrategy has a correct value.';
            console.log(errorResponse);
            reject({ message: errorResponse });
        }
    });
    return urlPromise;
}