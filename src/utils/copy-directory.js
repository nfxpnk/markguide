'use strict';

const { fs, path, log, c } = require('./common-utils.js');

/**
 * Copy files and directories from source to destination.
 * @param {string} sourceDir - abs path to source directory
 * @param {string} destDir - abs path to destination directory
 */
function copyFiles(sourceDir, destDir) {
    const items = fs.readdirSync(sourceDir);

    items.forEach(item => {
        const sourcePath = path.join(sourceDir, item);
        const destPath = path.join(destDir, item);
        const stat = fs.statSync(sourcePath);

        if (stat.isFile()) {
            // Filter out unwanted files if needed
            if (path.extname(item) === '.map' || /^\./.test(item)) {
                return;
            }
            try {
                fs.copyFileSync(sourcePath, destPath);
            } catch (e) {
                console.error(`Error copying file ${sourcePath} to ${destPath}:`, e);
            }
        } else if (stat.isDirectory()) {
            if (!fs.existsSync(destPath)) {
                try {
                    fs.mkdirSync(destPath);
                } catch (e) {
                    console.error(`Error creating directory ${destPath}:`, e);
                }
            }
            copyFiles(sourcePath, destPath);
        }
    });
}

/**
 * Entry function to copy files from source to destination.
 * @param {string} sourceDir - abs path to source directory
 * @param {string} destDir - abs path to destination directory
 */
function copyDirectory(sourceDir, destDir) {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    copyFiles(sourceDir, destDir);
}

module.exports = copyDirectory;
