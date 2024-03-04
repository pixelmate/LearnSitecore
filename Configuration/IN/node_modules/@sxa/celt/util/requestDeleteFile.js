const config = require(global.rootPath + '/gulp/config');
const path = require('path');
const request = require('request');
const getServerUrl = require('./getServerUrl.js')
module.exports = async function (file) {
    var serverUrl;
    if (global.resolvedUrl) {
        serverUrl = global.resolvedUrl
    } else {
        serverUrl = await getServerUrl()
    }
    let conf = config.serverOptions,
        name = path.basename(file.path),
        dirName = path.dirname(file.path),
        relativePath = path.relative(global.rootPath, dirName),
        url = `${serverUrl}${conf.removeScriptPath}?user=${encodeURIComponent(config.user.login)}&password=${encodeURIComponent(config.user.password)}&path=${conf.projectPath}${conf.themePath}/${relativePath}/${name}&database=master`;
    setTimeout(function () {
        request.get({
            url: url,
            agentOptions: {
                rejectUnauthorized: false
            }
        }, function (err, httpResponse, body) {
            try {
                var response = JSON.parse(body);
                if (!response.result) {
                    console.log(('Error: ' + response.Reason).red);
                } else {
                    if (process.env.debug == 'true') {
                        console.log('Removing successfull!'.green);
                    }
                }
                if (err) {
                    if (process.env.debug == 'true') {
                        return console.error(('removing failed:').red, err.red);
                    } else {
                        return
                    }
                }
            } catch (e) {
                if (process.env.debug == 'true') {
                    console.log(('Status code:' + httpResponse.statusCode).red);
                    console.log(('Answer:' + httpResponse.body).red);
                }

            }
        });
    }, 500)
}