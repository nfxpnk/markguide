'use strict';

const { fs, path, log, c } = require('./common-utils.js');

const mustache = require('mustache');

function writeNavigation(markguideConfig, projectTree) {
    log('Writing navigation file');

    const navigationPartial = fs.readFileSync(markguideConfig.partials['navigation'], 'utf8');

    const jsHtmlContent = mustache.render(
        navigationPartial,
        projectTree,
        {navigation: navigationPartial}
    );

    const jsContent = mustache.render(
        fs.readFileSync(markguideConfig.partials['navigation-javascript'], 'utf8'),
        {navigationHtml: jsHtmlContent}
    );


    fs.writeFileSync(
        markguideConfig.guideDest + 'nav.js',
        jsContent,
        error => {
            if (error) {
                log(error);
            }
        }
    );
}

module.exports = writeNavigation;
