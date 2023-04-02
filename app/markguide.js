'use strict';

const log = require('fancy-log');
const c = require('ansi-colors');

const copyAssets = require('./utils/copyassets.js');
const atlasConfig = require('./models/config.js');
const projectTree = require('./models/projectdocumentedtree.js');

function withConfig(configPath) {
    // Prepare config and basic models
    const config = atlasConfig(configPath);

    // If config has no proper fields
    if (config.isCorrupted) {
        return {
            build: () => Promise.reject('Config is corrupted'),
            buildAll: () => Promise.reject('Config is corrupted')
        };
    }

    // Copy internal assets to the components destinations
    log(c.green(config.internalAssetsPath), config.guideDest);
    copyAssets(config.internalAssetsPath, config.guideDest);

    // setup plugins


    const tree = projectTree(config);
    const buildComponent = require('./buildcomponent.js')(config, tree).buildComponent;

    return {
        build: buildComponent,
        buildAll: () => Promise.all([
            buildComponent()
        ])
    };
}

module.exports = { withConfig };
