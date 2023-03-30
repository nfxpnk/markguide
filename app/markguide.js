'use strict';

const path = require('path');
const log = require('fancy-log');
const c = require('ansi-colors');

function withConfig(configPath) {
    // Prepare config and basic models
    const atlasConfig = require(path.resolve(__dirname, '../models/atlasconfig.js'))(configPath);

    // If config has no proper fields
    if (atlasConfig.isCorrupted) {
        // log
        return {
            'build': () => new Promise(resolve => resolve('Config is corrupted')),
            'buildAll': () => new Promise(resolve => resolve('Config is corrupted'))
        };
    }

    const projectTree = require(path.resolve(__dirname, '../models/projectdocumentedtree.js'))(atlasConfig);

    // Prepare Utils based on config
    const writePage = require('./utils/writepage.js')(atlasConfig, projectTree).writePage;

    const buildComponent = require('./buildcomponent.js')(
        atlasConfig, projectTree, writePage).buildComponent;

    // Copy internal assets to the components destinations
    log(c.green(atlasConfig.internalAssetsPath), atlasConfig.guideDest);
    require(path.join(__dirname, '/utils/copyassets.js'))(atlasConfig.internalAssetsPath, atlasConfig.guideDest);

    return {
        'build': buildComponent,
        'buildAll': () => Promise.all([
            buildComponent()
        ])
    };
}

module.exports = { withConfig };
