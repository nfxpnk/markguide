'use strict';

const { fs, path, log, c } = require('./utils/common-utils.js');

const {copyFiles, copyDirectory} = require('./utils/copy.js');
const markguideConfig = require('./config/config.js');
const projectTree = require('./models/project-tree.js');

function copyDirectoriesAndFiles(config) {
    // Copy internal assets to the components destinations
    log(c.green(config.internalAssetsPath), config.guideDest);
    copyDirectory(config.internalAssetsPath, path.join(config.guideDest, 'assets'));

    // Copy images
    copyDirectory(config.projectImagesFolder, path.join(config.guideDest, 'images'));

    // Copy styles
    if(config.projectStylesFolder === config.projectStaticFiles) {
        copyFiles(config.projectStylesFolder, path.join(config.guideDest, 'styles'), 'css');
    } else {
        copyDirectory(config.projectStylesFolder, path.join(config.guideDest, 'styles'));
    }

    // Copy scritps
    if(config.projectScriptsFolder === config.projectStaticFiles) {
        copyFiles(config.projectScriptsFolder, path.join(config.guideDest, 'scripts'), 'js');
    } else {
        copyDirectory(config.projectScriptsFolder, path.join(config.guideDest, 'scripts'));
    }

    // Copy fonts
    copyDirectory(config.projectFontsFolder, path.join(config.guideDest, 'styles/fonts'));
}

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

    copyDirectoriesAndFiles(config);

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
