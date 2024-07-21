'use strict';

const { fs, path, log, c } = require('./common-utils.js');

const mustache = require('mustache');

function writeNavigation(markguideConfig, projectTree) {
    log('Writing navigation file');

    const navigationPartialPath = markguideConfig.partials['navigation'];
    const navigationJsPartialPath = markguideConfig.partials['navigation-javascript'];
    const navigationOutputPath = path.join(markguideConfig.guideDest, 'nav.js');

    const navigationPartial = fs.readFileSync(navigationPartialPath, 'utf8');
    const navigationJsPartial = fs.readFileSync(navigationJsPartialPath, 'utf8');

    const navigationHtmlContent = mustache.render(navigationPartial, projectTree, { navigation: navigationPartial });
    const jsContent = mustache.render(navigationJsPartial, { navigationHtml: navigationHtmlContent });

    fs.writeFileSync(
        navigationOutputPath,
        jsContent,
        error => {
            if (error) {
                log(error);
            }
        }
    );
}

module.exports = writeNavigation;
