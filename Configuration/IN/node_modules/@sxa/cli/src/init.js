import path from 'path';
import execa from 'execa';
import chalk from 'chalk';
import { promisify } from 'util';
import ncp from 'ncp';
import os from 'os';

const copy = promisify(ncp);

const REQUIRED_FILES = [
    'gulp',
    'package.json',
    'gulpfile.js',
    '.eslintrc.js'
]

export const initTheme = async () => {
    try {
        console.log(chalk.green('Theme initialization...'));

        try {
            const result = await execa.commandSync(`npm i @sxa/Theme`, {
                cwd: os.tmpdir(),
            });

            if (result.failed) {
                return console.log('Failed to initialize theme');
            }

            const THEME_PATH = path.join(os.tmpdir(), 'node_modules', '@sxa', 'Theme')

            const REQUIRED_THEME_FILES = REQUIRED_FILES.map(f => path.join(THEME_PATH, f));

            const isRequiredThemeFile = filePath => REQUIRED_THEME_FILES.some((themeFile) =>
                filePath === THEME_PATH || filePath.includes(themeFile) && !filePath.endsWith('.bak')
            )

            await copy(THEME_PATH, process.cwd(), {
                clobber: false,
                filter: isRequiredThemeFile
            })
        } catch (e) {
            console.log(e);
        }
    } catch (e) {
        console.log(e)
    }
    return;
}
