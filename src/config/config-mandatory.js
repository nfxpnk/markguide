'use strict';

const { fs, path, log, c } = require('../utils/common-utils.js');

const projectRoot = process.cwd();

function makePathAbsolute(p, root = '') {
    if(path.isAbsolute(p)) {
        return path.join(p, '/');
    } else {
        if(path.isAbsolute(root)) {
            return path.join(root, p, '/');
        }

        return path.join(projectRoot, root, p, '/');
    }
}

function getMandatoryBaseConfig(config) {
    const corruptedConfig = { isCorrupted: true };

    if (!config.guideDest) {
        log(c.red('Error: ') + '"guideDest" not defined. This field is mandatory');
        return corruptedConfig;
    }

    // Process mandatory configs PATHs
    const markguideConfig = {
        guideSrc: makePathAbsolute(config.guideSrc),
        cssSrc: makePathAbsolute(config.cssSrc),
        projectStaticFiles: makePathAbsolute(config.projectStaticFiles),
        projectImagesFolder: makePathAbsolute(config.projectImagesFolder, config.projectStaticFiles),
        projectStylesFolder: makePathAbsolute(config.projectStylesFolder, config.projectStaticFiles),
        projectScriptsFolder: makePathAbsolute(config.projectScriptsFolder, config.projectStaticFiles),
        projectFontsFolder: makePathAbsolute(config.projectFontsFolder, config.projectStaticFiles),
        guideDest: makePathAbsolute(config.guideDest),
        internalAssetsPath: makePathAbsolute(config.internalAssetsPath)
    };

    // Check if path exist
    for (const [key, value] of Object.entries(markguideConfig)) {
        if (fs.existsSync(value) === false) {
            log(c.red('Error: ') +
            '"' + key + '" (' + value + ')' +
            ' in config unavailable or unreadable. ' +
            'Please check this path in config');

            return corruptedConfig;
        }
    }

    markguideConfig.excludedDirs = new RegExp(config.excludedDirs || '.^');
    markguideConfig.excludedCssFiles = new RegExp(config.excludedCssFiles || '.^');
    markguideConfig.excludedSassFiles = new RegExp(config.excludedSassFiles || '.^');

    markguideConfig.customPluginsPath = makePathAbsolute(config.customPluginsPath) || '';
    markguideConfig.enabledPlugins = config.enabledPlugins || undefined;

    markguideConfig.projectFonts = config.projectFonts || [];
    markguideConfig.projectStyles = config.projectStyles || [];
    markguideConfig.projectScripts = config.projectScripts || [];

    markguideConfig.projectStyles = modifyFilePaths(markguideConfig.projectStyles, 'css');
    markguideConfig.projectScripts = modifyFilePaths(markguideConfig.projectScripts, 'js');

    markguideConfig.sourceReplacements = config.sourceReplacements || {};

    /**
     * Modify file paths in the array based on their type.
     * @param {Array} files - Array of file paths (URLs or basenames).
     * @param {string} type - Type of file ('css' or 'js').
     * @returns {Array} - Array with modified paths.
     */
    function modifyFilePaths(files, type) {
        console.log(typeof files, files, type);
        // Ensure files is an array and type is valid
        if (!Array.isArray(files)) {
            throw new Error('First argument must be an array.');
        }
        if (type !== 'css' && type !== 'js') {
            throw new Error('Type must be either "css" or "js".');
        }

        // Define URL pattern
        const urlPattern = /^https?:\/\//;

        // Determine directory based on type
        const directory = type === 'css' ? 'styles' : 'scripts';

        return files.map(file => {
            // Check if the file is a URL
            if (urlPattern.test(file)) {
                return file; // Leave the URL as is
            } else {
                // Modify the basename
                return `${directory}/${file}.${type}`;
            }
        });
    }

    return markguideConfig;
}

module.exports = getMandatoryBaseConfig;
