'use strict';

const log = require('fancy-log');
const c = require('ansi-colors');

const copyAssets = require('./utils/copyassets.js');
const atlasConfig = require('./models/atlasconfig.js');
const projectTree = require('./models/projectdocumentedtree.js');

function withConfig(configPath) {
    // Prepare config and basic models
    const config = atlasConfig(configPath);

    // If config has no proper fields
    if (config.isCorrupted) {
        return {
            build: () => new Promise(resolve => resolve('Config is corrupted')),
            buildAll: () => new Promise(resolve => resolve('Config is corrupted'))
        };
    }

    // Copy internal assets to the components destinations
    log(c.green(config.internalAssetsPath), config.guideDest);
    copyAssets(config.internalAssetsPath, config.guideDest);

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
