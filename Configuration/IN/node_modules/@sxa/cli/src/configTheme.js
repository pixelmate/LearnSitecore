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
import { initConfig } from './config';
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
        });
    }
    if (!options.themeName) {
        questions.push({
            type: 'input',
            name: 'themeName',
            message: 'Specify theme name',
            default: 'CustomTheme',
        });
    }
    if (!options.assets) {
        questions.push({
            type: 'list',
            name: 'assets',
            message: 'Do you want to upload style and script files (By default only _pre-optimised files)',
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

async function promptForMissingOptions(options) {
    let answers = {};
    answers = {
        ...await inquirer.prompt([{
            type: 'list',
            name: 'copySass',
            message: 'Copy sass assets?',
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
        },
        {
            type: 'list',
            name: 'copyCss',
            message: 'Copy css assets?',
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
        }]), ...answers
    };
    return {
        ...options,
        answers: answers
    };
}


export async function createTheme(options) {
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
export async function configTheme(args) {
    initConfig(args);
    return;
}