'use strict';

const fs = require('fs');
const path = require('path');
const log = require('fancy-log');
const c = require('ansi-colors');
const projectRoot = process.cwd();

function findConfig(config) {
    if (config !== undefined) {
        if (typeof config === 'object') {
            return config;
        }
        const configPath = path.join(projectRoot, config);
        if (fs.existsSync(configPath)) {
            return require(configPath);
        }
    }

    log(c.red('Error: ') + 'Could not find Atlas configuration. Please pass path to config ' +
        'or raw config object into atlas.withConfig()');

    return undefined;
}

module.exports = findConfig;
