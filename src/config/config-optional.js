'use strict';

const { fs, path, log, c } = require('../utils/common-utils.js');

function getComponentsPrefix(config) {
    const prefixes = config.componentPrefixes;
    let prefixExp = '';

    if (prefixes && !Array.isArray(prefixes)) {
        log(c.yellow('Warning: ') +
            '"componentPrefixes" is defined, but it is not array. Default values used as fallback.');
    }

    if (Array.isArray(prefixes)) {
        prefixes.forEach(function(prefix) { // could be id or class
            prefixExp += `^.${prefix}|`;
        });
        prefixExp = prefixExp.replace(/\|$/g, '');
    } else {
        prefixExp = '^.b-|^.l-';
    }

    return new RegExp(prefixExp);
}

function getOptionalBaseConfigs(config) {
    let markguideConfig = {};

    // Optional configs
    markguideConfig.scssAdditionalImportsArray = config.scssAdditionalImportsArray || [];

    markguideConfig.excludedDirs = new RegExp(config.excludedDirs || '.^');
    markguideConfig.excludedCssFiles = new RegExp(config.excludedCssFiles || '.^');
    markguideConfig.excludedSassFiles = new RegExp(config.excludedSassFiles || '.^');

    markguideConfig.internalAssetsPath = path.join(__dirname, '../../assets');

    markguideConfig.componentPrefixes = getComponentsPrefix(config);
    markguideConfig.indexPageSource = config.indexPageSource;

    return markguideConfig;
}

module.exports = getOptionalBaseConfigs;
