import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import execa from 'execa';
import { readConfig } from '../util/serverConfigHelper'

const promptQuestions = [
    {

        type: 'list',
        name: 'js-es6Support',
        message: '[JS]Do you want to transpile ES6+ javascript files down to ES2015 (babel used)',
        choices: [{ name: 'yes', value: true }, { name: 'no', value: false }],
        default: 'yes',
    },
    {

        type: 'list',
        name: 'js-enableMinification',
        message: '[JS]Do you want to compile minified file (pre-optimized-min.js)',
        choices: [{ name: 'yes', value: true }, { name: 'no', value: false }],
        default: 'yes',
    },
    {

        type: 'list',
        name: 'js-disableSourceUploading',
        message: '[JS]Do you want to upload js source files (If false - only optimized file will be uploaded)',
        choices: [{ name: 'yes', value: false }, { name: 'no', value: true }],
        default: 'yes',
    },
    {

        type: 'list',
        name: 'css-enableMinification',
        message: '[CSS]Do you want to compile minified file (pre-optimized-min.css)',
        choices: [{ name: 'yes', value: true }, { name: 'no', value: false }],
        default: 'yes',
    },
    {

        type: 'list',
        name: 'css-disableSourceUploading',
        message: '[CSS]Do you want to upload css source files (If false - only optimized file will be uploaded)',
        choices: [{ name: 'yes', value: false }, { name: 'no', value: true }],
        default: 'yes',
    },
    {

        type: 'list',
        name: 'sass-disableSourceUploading',
        message: '[SASS]Do you want to upload sass source files (If false - only optimized css file will be uploaded)',
        choices: [{ name: 'yes', value: false }, { name: 'no', value: true }],
        default: 'yes',
    }
]
function configExist(filePath) {
    let _path = filePath ? filePath : './gulp/config.js';
    return fs.existsSync(path.resolve(`${process.cwd()}`, _path));
}
function themeExist(themeName) {
    return fs.existsSync(path.resolve(`${process.cwd()}`, `./${themeName}`));
}
async function updateConfig(args) {
    const entries = Object.entries(args),
        _path = path.resolve(`./gulp/config.js`);
    let configValue = await fs.readFileSync(_path, 'utf-8');
    for (var [flag, value] of entries) {
        let [section, flagName] = flag.split("-");
        try {
            let
                replace = `(${section}:[\\w\\d\\,\\:\\[\\]\\.\\r\\s\\"\\'\\/\\*\\-{}!]*?)(${flagName}:[\\r\\s\\']*)([\\w\\d\\:\\/\\.\\-]*)([\\']*,?[\\r\\s\\w\\d\\:\\.\\,\\/\\'\\-]*})`,
                re = new RegExp(replace, "g"),
                result = configValue.replace(re, `$1$2${value}$4`);
            configValue = result;
        } catch (e) {
            console.error(`Error: ${e}`, chalk.red.bold('ERROR'));
        }
    }
    fs.writeFileSync(_path, configValue);

}
function replaceDashes(str) {
    return str.replace(/[\/\\]/g, "\\\\")
}
async function updateServerConfig(args) {
    const entries = Object.entries(args),
        _path = path.resolve(`./gulp/serverConfig.json`);
    let configValue = await fs.readFileSync(_path, 'utf-8');
    for (var [flag, value] of entries) {
        let [section, flagName] = flag.split("-");
        try {
            let
                replace = `([\\"]*${section}[\\"]*:[\\\\\\w\\d\\,\\:\\[\\]\\.\\r\\s\\"\\'\\/\\*\\-\\{]*)([\\"]*${flagName}[\\"]*:[\\r\\s\\'\\"]*)([\\\w\\d\\:\\/\\\\]*)([\\"\\r\\s\\w\\d\\:\\.\\,\\/\\'\\-\\}]*)`,
                re = new RegExp(replace, "g"),
                result = configValue.replace(re, `$1$2${replaceDashes(value)}$4`);
            configValue = result;
        } catch (e) {
            console.error(`Error: ${e}`, chalk.red.bold('ERROR'));
        }
    }
    fs.writeFileSync(_path, configValue);

}

export async function replaceInConfig(args) {
    if (!configExist()) {
        throw new Error(`Can\`t find config`)
    }
    await updateConfig(args);
};
export async function replaceInServerConfig(args) {
    if (!configExist("./gulp/serverConfig.json")) {
        throw new Error(`Can\`t find config`)
    }
    await updateServerConfig(args);
};

async function serverUrl() {
    let url = execa.commandSync(`sxa get-url`);
    url = url.stdout ? url.stdout : "https://sc"
    let themeUrl = {
        "serverOptions-server": url
    }
    const themeUrlSetUp = await inquirer.prompt({
        type: 'list',
        name: 'provideUrl',
        message: `Do you want to set up url to Sitecore instance?(Current is:${url})`,
        choices: [{ name: 'yes', value: true }, { name: 'no', value: false }],
        default: false

    });
    if (themeUrlSetUp.provideUrl) {
        themeUrl = await inquirer.prompt({
            type: 'input',
            name: 'serverOptions-server',
            message: 'Specify Sitecore instance url',
            default: themeUrl.url,
            validate: function (input) {
                if (input.length == 0) {
                    return "Url should contain at least 1 symbol";
                }
                return true;
            }
        });
    }

    return themeUrl
}

function fixSeparator(str) {
    if (str.slice(0,2)!=='\\\\' && str.slice(0,1)!=='\\'){
        str= `\\${str}`
    }
    return str.split("/").join("\\")
}

function fixThemePath(themePath){
    return themePath.indexOf("\\Themes")!=0? `\\Themes${themePath}`:themePath 
}

export async function themeConfig(themeName, themePath) {
    let themeSetUp = {};
	let currConfig = await readConfig(themeName);
    if (!themeName) {
        themeSetUp = {
            ...themeSetUp, ... await inquirer.prompt({
                type: 'input',
                name: 'serverOptions-themeName',
                message: 'Specify Sitecore theme name',
                default: currConfig.serverOptions.themePath,
                validate: function (input) {
                    if (input.length == 0) {
                        return "Theme name should contain at least 1 symbol";
                    }
                    return true;
                }
            })
        }
    }
    if (!themePath) {
        themeSetUp = {
            ...themeSetUp, ... await inquirer.prompt({
                type: 'input',
                name: 'serverOptions-themePath',
                message: 'Specify Sitecore theme path',
                default: currConfig.serverOptions.projectPath,
                validate: function (input) {
                    if (input.length == 0) {
                        return "Theme path should contain at least 1 symbol";
                    }
                    return true;
                }
            })
        }
    }
    return {
        "serverOptions-themePath": themeName ? fixSeparator(themeName) : fixSeparator(themeSetUp['serverOptions-themeName']),
        "serverOptions-projectPath": themePath ? fixThemePath(fixSeparator(themePath)) : fixThemePath(fixSeparator(themeSetUp['serverOptions-themePath']))
    }

}

export async function initConfig(options) {
	const themeUrl = await serverUrl();
    let _themeName = options && options.themeName ? options.themeName : '',
        _themePath = options && options.themePath ? options.themePath : '';

    const themeConfigResult = await themeConfig(_themeName, _themePath);

    const answers = await inquirer.prompt(promptQuestions);
    try {
        await replaceInConfig({ ...themeUrl, ...answers })
        await replaceInServerConfig(themeConfigResult)
        console.log(chalk.green("Done"))
        return await answers;
    } catch (e) {
        console.error(chalk.red.bold(`ERROR:${e.message}`));
        return await e
    }

}