'use strict';

const log = require('fancy-log');
const c = require('ansi-colors');

const copyAssets = require('./utils/copy-assets.js');
const atlasConfig = require('./models/config.js');
const projectTree = require('./models/project-tree.js');

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

    console.log(config);


    const tree = projectTree(config);
    const buildComponent = require('./build-component.js')(config, tree).buildComponent;

    return {
        build: buildComponent,
        buildAll: () => Promise.all([
            buildComponent()
        ])
    };
}

module.exports = { withConfig };
