'use strict';

const { fs, path, log, c } = require('../utils/common-utils.js');

function getIndexPageSource(projectRoot, guideSrc, indexPageSource) {
    const inConfig = indexPageSource ? indexPageSource : '';
    const inGuide = path.join(guideSrc, 'README.md');
    const inProject = path.join(projectRoot, 'README.md');
    let indexSrc;

    if (indexPageSource !== undefined && !fs.existsSync(inConfig)) {
        log(c.yellow('Warning: ') + '"indexPageSource" is defined, but resource is unavailable or unreadable. ' +
            'Please check this path in config. Fallback to README.md');
    }

    switch (true) {
        case fs.existsSync(inConfig):
            indexSrc = inConfig;
            break;
        case fs.existsSync(inGuide):
            indexSrc = inGuide;
            break;
        case fs.existsSync(inProject):
            indexSrc = inProject;
            break;
        default:
            indexSrc = '';
    }

    return indexSrc;
}

module.exports = getIndexPageSource;
