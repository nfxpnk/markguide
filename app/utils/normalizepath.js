'use strict';

const path = require('path');
const cwd = process.cwd();

function normalizePath(filePath) {
    if (filePath !== undefined) {
        return path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
    } else {
        return filePath;
    }
}

module.exports = normalizePath;
