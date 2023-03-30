'use strict';

const fs = require('fs');
const path = require('path');
const log = require('fancy-log');
const c = require('ansi-colors');
const projectRoot = process.cwd();

function absPath(relPath) {
    return path.join(projectRoot, relPath, '/');
}

function isPathReachable(destination, name) {
    if (!destination) {
        log(c.red('Error: ') + '"' + name + '" not defined. This field is mandatory');

        return false;
    }

    if (fs.existsSync(destination) === false && fs.existsSync(absPath(destination)) === false) {
        log(c.red('Error: ') +
            '"' + name + '" (' + destination + ', ' + absPath(destination) + ')' +
            ' in config unavailable or unreadable. ' +
            'Please check this path in config');

        return false;
    }

    return true;
}

function getMandatoryBaseConfig(config) {
    const corruptedConfig = { isCorrupted: true };

    if (!isPathReachable(config.guideSrc, 'guideSrc') ||
        !isPathReachable(config.cssSrc, 'cssSrc')) {
        return corruptedConfig; // return with corrupted config if we don't have critical info
    }

    if (!config.guideDest) {
        log(c.red('Error: ') + '"guideDest" not defined. This field is mandatory');
        return corruptedConfig;
    }

    // Process mandatory configs
    const atlasConfig = {
        guideSrc: fs.existsSync(config.guideSrc) ? config.guideSrc : absPath(config.guideSrc),
        cssSrc: fs.existsSync(config.cssSrc) ? config.cssSrc : absPath(config.cssSrc),
        guideDest: fs.existsSync(config.guideDest) ? config.guideDest : absPath(config.guideDest)
    };

    // Check and create destination directory if needed
    const createDestination = config.createDestFolder || false;

    if (fs.existsSync(atlasConfig.guideDest) === false) {
        if (createDestination) {
            fs.mkdirSync(atlasConfig.guideDest);
            log(c.yellow('Warning: ') + '"guideDest": ' + atlasConfig.guideDest + ' directory created');
        } else {
            log(c.red('Error: ') + '"guideDest" (' + atlasConfig.guideDest + ') in config unavailable or unreadable. ' +
                'Please check this path in config');
            return corruptedConfig;
        }
    }

    console.log(atlasConfig, config);

    return atlasConfig;
}

module.exports = getMandatoryBaseConfig;
