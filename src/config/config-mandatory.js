'use strict';

const { fs, path, log, c } = require('../utils/common-utils.js');

const projectRoot = process.cwd();

function makePathAbsolute(p) {
    if(path.isAbsolute(p)) {
        return p;
    } else {
        return path.join(projectRoot, p, '/');
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
    markguideConfig.enabledPlugins = config.enabledPlugins || undefined;
    markguideConfig.customPluginsPath = makePathAbsolute(config.customPluginsPath) || '';
    markguideConfig.projectFonts = config.projectFonts || [];
    markguideConfig.projectStyles = config.projectStyles || [];
    markguideConfig.projectScripts = config.projectScripts || [];

    return markguideConfig;
}

module.exports = getMandatoryBaseConfig;
