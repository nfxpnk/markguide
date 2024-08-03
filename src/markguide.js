'use strict';

const { fs, path, log, c } = require('./utils/common-utils.js');

const copyDirectory = require('./utils/copy-directory.js');
const markguideConfig = require('./config/config.js');
const projectTree = require('./models/project-tree.js');

function withConfig(configPath) {
    // Prepare config and basic models
    const config = markguideConfig(configPath);

    // If config has no proper fields
    if (config.isCorrupted) {
        return {
            build: () => Promise.reject(new Error('Config is corrupted')),
            buildAll: () => Promise.reject(new Error('Config is corrupted'))
        };
    }

    // Copy internal assets to the components destinations
    log(c.green(config.internalAssetsPath), config.guideDest);
    copyDirectory(config.internalAssetsPath, config.guideDest);

    // Copy fonts
    copyDirectory(path.join(config.projectStaticFiles, 'fonts'), path.join(config.guideDest, 'styles/fonts'));

    // Setup plugins

    console.log(config);

    const tree = projectTree(config);

    const writeNavigation = require('./utils/write-navigation.js');
    writeNavigation(config, tree);

    const buildComponent = require('./build-component.js')(config, tree).buildComponent;

    return {
        build: buildComponent,
        buildAll: () => Promise.all([
            buildComponent()
        ])
    };
}

module.exports = {
    withConfig,
    basePlugin: require('./models/base-plugin.js')
};
