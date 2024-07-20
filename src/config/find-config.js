'use strict';

const fs = require('fs');
const path = require('path');
const log = require('fancy-log');
const c = require('ansi-colors');

// Get the current working directory as the project root
const projectRoot = process.cwd();

// Find and load the configuration
function findConfig(config) {
    // Check if a configuration object was passed directly
    if (config !== undefined) {
        if (typeof config === 'object') {
            return config;
        }
        const configPath = path.join(projectRoot, config);

        if (fs.existsSync(configPath)) {
            return require(configPath);
        }
    }

    log(c.red('Error: ') + 'Could not find configuration. ' + configPath + ' Please pass path to config ' +
        'or raw config object into atlas.withConfig()');

    return undefined;
}

module.exports = findConfig;
