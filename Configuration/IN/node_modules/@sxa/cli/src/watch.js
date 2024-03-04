import execa from 'execa';
import gulp from 'gulp';
import path from 'path';
import { series } from 'async';
import { execFile, exec, spawn } from 'child_process';
import { hasInstalledModules } from '../util/configHelper'

const taskType = 'watch',
    buildAllName = 'All';
function taskNameBuilder(taskName) {
    let _taskName = taskName ? taskName : buildAllName
    if (_taskName.indexOf(taskType) !== 0) {
        _taskName = `${taskType}${_taskName}`
    }
    return _taskName
}

function setUser(login, password) {
    global.user = { login: login, password: password }
}
function setUrl(url) {
    global.serverUrl = url
}
export async function watchAssets(args) {
    try {
        let user,
            taskName = taskNameBuilder(args.taskName);
        process.env.debug = args.debug;
        try {
            if (!hasInstalledModules()) {
                return console.log('node_modules folder was not found. Please install packages using `npm i`.')
            }
            var all = require(path.join(process.cwd(), 'gulpfile.js'));
        } catch (e) {
            if (e.code == "MODULE_NOT_FOUND") {
                return console.log('gulpfile.js was not found. Please open theme folder.');
            } else {
                return console.log(e.code);
            }
        }
        if (typeof all[taskName] === 'undefined') {
            return console.log(`Task ${taskName} is not defined`.red)
        }
        if (args.login && args.password) {
            user = setUser(args.login, args.password);
        }
        if (args.url) {
            user = setUrl(args.url);
        }
        all[taskName]();
    } catch (e) {
        console.log(e)
    }
    return;
}