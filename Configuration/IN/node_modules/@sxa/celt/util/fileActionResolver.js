const path = require('path');
const deleteFile = require('./requestDeleteFile');
const changeFile = require('./requestChangeFile');
const skipSending = require('./skipSending');
const changeTemplate = require('./requestChangeTemplate');
const changeScriban = require('./requestChangeScriban');
const Queue = require('./Queue');

const queue = new Queue();
module.exports.queueInstance = queue;
module.exports.fileActionResolver = function (file, callback = null) {
    let fileName = path.basename(file.path),
        eventType = file.event;// add, unlink , change 
    if (skipSending(file.path)) {
        console.log(('Sending of file ' + fileName + ' was skipped').blue);
        return;
    }
    if (fileName.indexOf('.html') > -1 && eventType === 'change') {
        return queue.add(() => changeTemplate(file));
    }
    if (fileName.indexOf('.scriban') > -1) {
        return queue.add(() => changeScriban(file));
    }
    if (eventType == 'change' || eventType == 'add') {
        return queue.add(() => changeFile(file));
    } else if (eventType == 'unlink') {
        return queue.add(() => deleteFile(file));
    }
};