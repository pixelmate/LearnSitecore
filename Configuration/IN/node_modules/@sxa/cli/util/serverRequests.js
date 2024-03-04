import request from 'request';
import chalk from 'chalk';

const MODULES_URL = "/-/script/v2/master/Get-NewThemeModules"
const THEME_URL = "/-/script/v2/master/New-Theme"
const promisifiedRequest = function (options) {
    return new Promise((resolve, reject) => {
        request(options, (err, httpResponse, body) => {
            try {
                let response = JSON.parse(body);
                if (err) {
                    console.log(chalk.red.bold('getting of Module list failed:' + err));
                    return reject(err);
                }

                if (httpResponse.statusCode !== 200) {
                    console.log(chalk.red.bold('Status code:' + httpResponse.statusCode));
                    console.log(chalk.red.bold('Answer:' + httpResponse.body));
                }
                return resolve(response);
            } catch (e) {
                if (typeof httpResponse == "undefined") {
                    console.log(chalk.red.bold('Server did not provide any response'));
                } else {
                    console.log(chalk.bold.red(body.match(/<li>([\d\w\s\.]*)<\/li>/)[1]))
                }
                return reject(new Error('Error during parsing an answer from the server'))
            }
        });
    });
};

export async function getModulesList(serverUrl, userObj) {
    let url = `${serverUrl}${MODULES_URL}?user=${encodeURIComponent(userObj.login)}&password=${encodeURIComponent(userObj.password)}`
    var a = await promisifiedRequest({
        url: url,
        type: "GET",
        agentOptions: {
            rejectUnauthorized: false
        }
    }).catch(err => {
        return a = [];
    });
    return a;
}

export async function createTheme(serverUrl, userObj, themeData) {
    let url = `${serverUrl}${THEME_URL}?user=${encodeURIComponent(userObj.login)}&password=${encodeURIComponent(userObj.password)}`
    var obj = {
        "createNewSiteThemeModel": {
            themeName: themeData.themeName,
            themeLocation: themeData.themePath,
            definitionItems: themeData.themeModules
        }
    };
    var formData = {
        CreateNewSiteThemeModel: JSON.stringify(obj)
    };

    var a = await promisifiedRequest({
        url: url,
        method: "POST",
        form: formData,
        agentOptions: {
            rejectUnauthorized: false
        }
    });
    return a;
}