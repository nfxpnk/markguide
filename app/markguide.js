'use strict';

const path = require('path');
const log = require('fancy-log');
const c = require('ansi-colors');

const atlasConfig = require('../models/atlasconfig.js');
const projectTree = require('../models/projectdocumentedtree.js');
const copyAssets = require('./utils/copyassets.js');

function withConfig(configPath) {
    // Prepare config and basic models
    const config = config(configPath);

    // If config has no proper fields
    if (config.isCorrupted) {
        // log
        return {
            build: () => new Promise(resolve => resolve('Config is corrupted')),
            buildAll: () => new Promise(resolve => resolve('Config is corrupted'))
        };
    }

    const tree = projectTree(config);
    const writePage = require('./utils/writepage.js')(config, tree).writePage;
    const buildComponent = require('./buildcomponent.js')(config, tree, writePage).buildComponent;

    // Copy internal assets to the components destinations
    log(c.green(config.internalAssetsPath), config.guideDest);
    copyAssets(config.internalAssetsPath, config.guideDest);

    return {
        build: buildComponent,
        buildAll: () => Promise.all([
            buildComponent()
        ])
    };
}

module.exports = { withConfig };
