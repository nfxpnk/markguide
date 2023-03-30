'use strict';

const fs = require('fs');
const path = require('path');
const excludedDir = 'scss';

/**
 * Copy internal assets to specified Atlas destination directory, so they will be available in generated static files.
 * @private
 * @param {string} assetsRoot - abs path to internal assets directory
 * @param {string} assetsSrc - abs path to processed internal assets directory
 * @param {string} assetsDest - abs path to atlas directory in project space
 */
function copyAssetsFiles(assetsRoot, assetsSrc, assetsDest) {
    const dir = fs.readdirSync(assetsSrc);

    dir.forEach(item => {
        const name = item;
        const source = path.join(assetsSrc, name);
        const resource = fs.statSync(source);
        const assetRelSrc = path.relative(assetsRoot, source);

        if (resource.isFile()) {
            if (path.extname(name) === '.map' || /^\./.test(name)) {
                return;
            }
            const target = path.join(assetsDest, assetRelSrc);
            try {
                fs.writeFileSync(target, fs.readFileSync(source));
            } catch (e) {
                console.error(e);
            }
        }
        if (resource.isDirectory()) {
            if (name === excludedDir) {
                return;
            }
            const directory = path.join(assetsDest, assetRelSrc);
            if (!fs.existsSync(directory)) {
                try {
                    fs.mkdirSync(directory);
                } catch (e) {
                    console.error(e);
                }
            }
            copyAssetsFiles(assetsRoot, source, assetsDest);
        }
    });
}

function copyAssets(assetsSrc, assetsDest) {
    const dest = path.join(assetsDest, 'assets');

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }
    copyAssetsFiles(assetsSrc, assetsSrc, dest);
}

module.exports = copyAssets;
