
import execa from 'execa';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import rimraf from 'rimraf';
import { promisify } from 'util';
import ncp from 'ncp';
import os from 'os';
const copy = promisify(ncp);

async function isThemeExist() {
    let _path = path.resolve(process.cwd(), './node_modules/@sxa/Theme');
    return fs.existsSync(_path);
}

export async function initGit(options) {
    try {
        let cwd = options.targetDirectory ? options.targetDirectory : path.resolve(process.cwd(), './Test');
        console.log(chalk.green('Theme downloading....'));
        try {
            let result = await execa.commandSync(`npm i @sxa/Theme`, {
                cwd: os.tmpdir(),
            });
            if (result.failed) {
                return console.log('Failed to initialize git');
            }

            await copy(path.resolve(process.cwd(), path.join(os.tmpdir(), 'node_modules', '@sxa', 'Theme')), cwd, {
                clobber: false,
            });
            
            rimraf.sync(path.resolve(path.resolve(process.cwd(), cwd), './node_modules'));
        } catch (e) {
            console.log(e)
        }


    } catch (e) {
        console.log(e)
    }
    return;
}