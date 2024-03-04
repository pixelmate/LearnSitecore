import arg from 'arg';
import inquirer from 'inquirer';
import execa from 'execa';
import path from 'path';
import util from 'util';
import { generateTheme } from './new';
import { initConfig } from './config';

async function initGit(options) {
    try {
        const result = await execa.commandSync('git clone https://github.com/anton-kulagin/Basic.git', [], {
            cwd: options.targetDirectory ? options.targetDirectory : path.resolve(process.cwd(), './Test'),
        });
        if (result.failed) {
            return Promise.reject(new Error('Failed to initialize git'));
        }
    } catch (e) {
    }
    return;
}

export async function setupConfig() {
    let options = await initConfig();
}