const config = require(global.rootPath + "/gulp/config");
const path = require("path");
const request = require("request");
const fs = require("fs");
const colors = require("colors");
const getServerUrl = require("./getServerUrl.js");
module.exports = async function (file) {
    var serverUrl;
    if (global.resolvedUrl) {
        serverUrl = global.resolvedUrl;
    } else {
        serverUrl = await getServerUrl();
    }
    var conf = config.serverOptions,
        name = path.basename(file.path),
        dirName = path.dirname(file.path),
        relativePath = path.relative(global.rootPath, dirName),
        filePath = relativePath;
    if (relativePath.length == 0) {
        filePath = global.rootPath;
    }

    prom = new Promise((resolve, reject) => {
        let url = `${serverUrl}${
            conf.uploadScriptPath
        }?user=${encodeURIComponent(
            config.user.login
        )}&password=${encodeURIComponent(config.user.password)}&script=${
            conf.projectPath
        }${
            conf.themePath
        }/${relativePath}&sc_database=master&apiVersion=media&scriptDb=master`;
        var formData = {
            file: fs.createReadStream(dirName + "\\" + name),
        };
        var a = request.post(
            {
                url: url,
                formData: formData,
                agentOptions: {
                    rejectUnauthorized: false,
                },
            },
            function (err, httpResponse, body) {
                resolve();
                if (err) {
                    return console.log(
                        ("upload of " + name + " failed:" + err).red
                    );
                }
                if (httpResponse.statusCode !== 200) {
                    console.log(("Status code:" + httpResponse.statusCode).red);
                    console.log(("Answer:" + httpResponse.body).red);
                    return;
                } else {
                    if (process.env.debug == "true") {
                        return console.log(
                            ("Uploading of " + name + " was successful!").green
                        );
                    } else {
                        return;
                    }
                }
            }
        );
    });
    return prom;
};
