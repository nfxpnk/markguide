'use strict';

const log = require('fancy-log');
const c = require('ansi-colors');

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

module.exports = getComponentsPrefix;
