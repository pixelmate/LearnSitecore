import arg from 'arg';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import ncp from 'ncp';
import Listr from 'listr';
import chalk from 'chalk';
import { promisify } from 'util';
import { initGit } from './git';
import rimraf from 'rimraf';
import { initConfig, replaceInConfig } from './config';
import { registerUrl } from './register';
import { getServerUrl } from '../util/configHelper'
import { createTheme } from '../util/serverRequests'
import { getModulesList } from "../util/serverRequests";
const access = promisify(fs.access);
const copy = promisify(ncp);

function folderExist(options) {
    let _path = path.resolve(process.cwd(), `./${options.themeName}`);
    return fs.existsSync(_path);

}
async function createThemeFolder(options) {
    let _path = path.resolve(process.cwd(), `./${options.themeName}`);
    if (folderExist(options)) {
        await fs.mkdirSync(_path);
    } else {

    }
    return await null;
}

async function deleteFolder(options) {
    let _path = path.resolve(process.cwd(), `./${options.themeName}`);
    try {
        await fse.remove(_path)
        console.log(chalk.green.bold(`Done:${options.themeName} folder was deleted`))
    } catch (err) {
        console.error(err)
    }
}

async function copyTemplateFiles(options) {
    let _path = path.resolve(process.cwd(), `./${options.themeName}`);
    await access(_path, fs.constants.R_OK);
    return copy(options.templateDirectory, _path, {
        clobber: false,
    });
}


async function promptForPackage(options) {
    const questions = [];
    if (!options.url) {
        questions.push({
            type: 'input',
            name: 'url',
            message: 'Specify instance url',
            default: 'https://sxa',
            validate: function (input) {
                if (input.length == 0) {
                    return "Instance url should contain at least 1 symbol";
                }
                return true;
            }
        });
    }
    if (!options.themeName) {
        questions.push({
            type: 'input',
            name: 'themeName',
            message: 'Specify theme name',
            default: 'CustomTheme',
            validate: function (input) {
                if (input.length == 0) {
                    return "Theme name should contain at least 1 symbol";
                }
                return true;
            }
        });
    }
    if (!options.assets) {
        questions.push({
            type: 'list',
            name: 'assets',
            message: 'Do you want to build assets for styles and scripts(By default only _pre-optimised files)',
            choices: [{ name: 'yes', value: true }, { name: 'no', value: false }],
            default: 'yes',
        });
    }

    const answers = await inquirer.prompt(questions);
    return {
        ...options,
        url: options.url || answers.url,
        themeName: options.themeName || answers.themeName,
        assets: options.assets || answers.assets
    };
}

async function updateConfigUrl() {
    let registeredUrl = await getServerUrl();
    replaceInConfig({
        "serverOptions-server": registeredUrl
    });
}

async function promptForMissingOptions(options) {
    let answers = {};
    if (!options.themeName) {
        answers = {
            ...await inquirer.prompt({
                type: 'input',
                name: 'themeName',
                message: 'Specify theme name',
                default: 'CustomTheme',
                validate: function (input) {
                    if (input.length == 0) {
                        return 'Theme name should contain at least 1 symbol';
                    }
                    return true;
                }
            }), ...answers
        };
    }
    if (!options.themeNamePath) {
        answers = {
            ...await inquirer.prompt({
                type: 'input',
                name: 'themePath',
                message: 'Specify theme path. Root is Themes folder(format <RootFolderName/ChildFolderName>)',
                default: 'CustomThemePath',
                validate: function (input) {
                    if (input.length == 0) {
                        return "Custom theme path should contain at least 1 symbol";
                    }
                    return true;
                }
            }), ...answers
        };
    }
    if (!options.config) {
        answers = {
            ... await inquirer.prompt({
                type: 'list',
                name: 'config',
                message: 'Do you want to set up theme config file?',
                choices: [
                    {
                        key: 'y',
                        name: 'yes',
                        value: true
                    },
                    {
                        key: 'n',
                        name: 'no',
                        value: false
                    }
                ]
            }), ...answers
        };
    }

    return {
        ...options,
        themeName: options.themeName || answers.themeName,
        themePath: options.themePath || answers.themePath,
        config: options.config || answers.config
    };
}
export async function createLocalTheme(options) {
    options = {
        ...options,
        targetDirectory: options.themeName || './CustomTheme'
    };
    if (folderExist(options)) {
        options = {
            ... await inquirer.prompt({
                type: 'list',
                name: 'deleteFolder',
                message: `Folder ${options.themeName} name already exist. Do you want to delete it before creation of a new theme?`,
                choices: [
                    {
                        key: 'y',
                        name: 'yes',
                        value: true
                    },
                    {
                        key: 'n',
                        name: 'no',
                        value: false
                    }
                ]
            }), ...options
        };
        if (options.deleteFolder) {
            await deleteFolder(options)
        } else {
            console.error('%s Folder with such name already exist.', chalk.red.bold('ERROR:'));
            process.exit(1);
        }
    }
    let listOfAction = [
        {
            title: 'Create theme folder',
            task: async () => await createThemeFolder(options),
            skip: () =>
                !options.themeName
                    ? 'Theme name was not specified'
                    : undefined,
        },
        {
            title: 'copy project files',
            task: async () => await initGit(options),
            skip: () =>
                !options.themeName
                    ? ''
                    : undefined,
        }
    ]

    const tasks = new Listr(
        listOfAction,
        {
            exitOnError: false,
        }
    );


    await tasks.run();
    if (options.config) {
        process.chdir(path.resolve(process.cwd(), `./${options.targetDirectory}`));
        await initConfig(options);

    }
    console.log('%s Project ready', chalk.green.bold('DONE'));

    return true;
}

async function instanceUrl(args) {
    let registeredUrl = await getServerUrl();
    let answers = {};
    if (typeof args.url !== 'undefined') {
        registeredUrl = args.url;
        answers.isCorrectUrl = false;
    } else {
        answers = {
            ...await inquirer.prompt({
                type: 'list',
                name: 'isCorrectUrl',
                message: `The theme will be created for instance based on url ${chalk.green.bold(registeredUrl)}. Do you want to specify a different url?`,
                default: false,
                choices: [
                    {
                        key: 'n',
                        name: 'no',
                        value: false
                    },
                    {
                        key: 'y',
                        name: 'yes',
                        value: true
                    }
                ]
            }), ...answers
        };
    }

    if (answers.isCorrectUrl) {
        answers = {
            ...await inquirer.prompt({
                type: 'input',
                name: 'themeUrl',
                message: 'Please specify url where theme should be created',
                default: 'https://sc',
            }), ...answers
        };
        await registerUrl({ url: answers.themeUrl });
        registeredUrl = answers.themeUrl;
    };
    return registeredUrl;

}
async function getUserObj() {
    let answers = await inquirer.prompt([{
        type: 'input',
        name: 'login',
        message: 'Enter your login',
        default: 'sitecore\\admin',
        validate: function (input) {
            if (input.length == 0) {
                return "login should contain at least 1 symbol";
            }
            return true;
        }
    }, {
        type: 'password',
        name: 'password',
        message: 'Enter your password',
        default: 'b',
        validate: function (input) {
            if (input.length == 0) {
                return "Password should contain at least 1 symbol";
            }
            return true;
        }
    }
    ])
    return answers;
}
async function prepareModulesQuestions(modules) {
    var question = {
        type: 'checkbox',
        name: 'themeModules',
        message: 'Choose active modules for your theme',
        choices: []
    }
    await modules.forEach(el => {
        question.choices.push(
            {
                ...el, ...{
                    value: el.ID,
                    name: el.Name.replace(/\s+/g, ''),
                    checked: true
                }
            }
        )
    })
    return question;
}
async function selectModules(moduleList) {
    let questionList = await prepareModulesQuestions(moduleList);
    let answers = await inquirer.prompt(questionList)
    return answers;
}

function fixServerConfigPath(options) {
    let _options = options
    _options.themeName = `\\${options.themeName}`
    _options.themePath = `\\Theme\\${options.themePath}`
}

export async function generateTheme(args) {
    let url = await instanceUrl(args);
    if (!!url) {
        let user = await getUserObj();
        let options = await promptForMissingOptions(args);
        let moduleList = await getModulesList(url, user);
        if (moduleList.length === 0) {
            process.exit(1);
        }

        let selectedModules = await selectModules(moduleList);
        try {
            let createThemeResponse = await createTheme(url, user, {
                ...options, ...selectedModules
            });
            if (!createThemeResponse.result) {
                if (createThemeResponse.Reason && createThemeResponse.Reason.Message) {
                    console.error(chalk.red.bold('ERROR: Unknown error while creating theme'));
                } else {
                    if (typeof createThemeResponse.Reason == "string") {
                        console.error(chalk.red.bold(`ERROR: ${createThemeResponse.Reason}`));
                    } else if (typeof createThemeResponse.Reason == "object") {
                        console.error(chalk.red.bold(`ERROR: ${createThemeResponse.Reason.FullyQualifiedErrorId}`));
                    } else {
                        console.error(chalk.red.bold(`ERROR: ${createThemeResponse.Reason.Message}`));
                    }

                }
            } else {
                await createLocalTheme(options);
            }
        } catch (e) {
            console.log(e)
        }


    } else {
        console.error(chalk.red.bold('ERROR: Invalid instance url'));
    }
}