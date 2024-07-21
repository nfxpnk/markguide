'use strict';

const { fs, path, log, c } = require('./common-utils.js');

const cwd = process.cwd();

/**
 * Normalize a file path.
 *
 * @param {string} filePath - The file path to normalize.
 * @returns {string} The normalized file path.
 */
function normalizePath(filePath) {
    if (filePath !== undefined) {
        return path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
    }

    return filePath;
}

module.exports = normalizePath;
