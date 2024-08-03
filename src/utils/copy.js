'use strict';

const { fs, path, log, c } = require('./common-utils.js');

/**
 * Copy files from source to destination with optional extension filtering.
 * @param {string} sourceDir - Absolute path to source directory
 * @param {string} destDir - Absolute path to destination directory
 * @param {string} [ext] - Optional file extension to filter by (without the dot)
 */
function copyFiles(sourceDir, destDir, ext) {
    const items = fs.readdirSync(sourceDir);

    items.forEach(item => {
        const sourcePath = path.join(sourceDir, item);
        const destPath = path.join(destDir, item);
        const stat = fs.statSync(sourcePath);

        if (stat.isFile()) {
            if (ext && path.extname(item) !== `.${ext}`) {
                return; // Skip files that do not match the extension
            }
            try {
                fs.copyFileSync(sourcePath, destPath);
            } catch (e) {
                console.error(`Error copying file ${sourcePath} to ${destPath}:`, e);
            }
        }
    });
}

/**
 * Recursively copy directory contents from source to destination.
 * @param {string} sourceDir - Absolute path to source directory
 * @param {string} destDir - Absolute path to destination directory
 */
function copyDirectory(sourceDir, destDir) {
    if (!fs.existsSync(destDir)) {
        try {
            fs.mkdirSync(destDir, { recursive: true });
        } catch (e) {
            console.error(`Error creating directory ${destDir}:`, e);
            return; // Exit if directory creation fails
        }
    }

    console.log(sourceDir, destDir);

    const items = fs.readdirSync(sourceDir);

    items.forEach(item => {
        const sourcePath = path.join(sourceDir, item);
        const destPath = path.join(destDir, item);
        const stat = fs.statSync(sourcePath);

        if (stat.isDirectory()) {
            copyDirectory(sourcePath, destPath); // Recursive call for subdirectories
        }
    });

    // After all directories are copied, copy files in the current directory
    copyFiles(sourceDir, destDir);
}

module.exports = {
    copyFiles,
    copyDirectory,
};
