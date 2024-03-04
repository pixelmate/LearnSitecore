const config = require(global.rootPath + '/gulp/config');
const path = require('path');
const request = require('request');
const fs = require('fs');
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
        prom = new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve();
            }, 600);
            let url = `${serverUrl}${conf.updateTemplatePath}?user=${encodeURIComponent(config.user.login)}&password=${encodeURIComponent(config.user.password)}&path=${name}`;
            var formData = {
                file: fs.createReadStream(dirName + '/' + name),
            };
            var a = request.post({
                url: url,
                formData: formData,
                agentOptions: {
                    rejectUnauthorized: false
                }
            }, function (err, httpResponse, body) {
                resolve();
                if (err) {
                    return console.log(('upload failed:' + err).red);
                }
                if (httpResponse.statusCode !== 200) {
                    console.log(('Status code:' + httpResponse.statusCode).red);
                    console.log(('Answer:' + httpResponse.body).red);
                    return
                } else {
                    return console.log(('Uploading of ' + name + ' was successful!').green);
                }


            });

        });
    return prom;
}