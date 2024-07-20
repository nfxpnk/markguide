'use strict';

const fs = require('fs');
const mustache = require('mustache');
const log = require('fancy-log');

function writeNavigation(atlasConfig, projectTree) {
    const tpl = `
    const asideNav = \`;;;;;;\`;

    document.addEventListener('DOMContentLoaded', function () {
        const asideNavContainer = document.getElementById('js-atlas-navigation');
        asideNavContainer.innerHTML = asideNav;

        const event = new CustomEvent('MyEventFired', {
            detail: { message: 'Hello, world!' } // Optional: pass additional data here
        });

       document.dispatchEvent(event);
    });
    `;

    log('Writing navigation file....');

    //console.log(projectTree);

    let js = mustache.render(
        fs.readFileSync(atlasConfig.partials.navigation, 'utf8'),
        projectTree,
        {
            'navigation': fs.readFileSync(atlasConfig.partials.navigation, 'utf8')
        }
    );

    js = tpl.replace(';;;;;;', js);

    fs.writeFileSync(
        atlasConfig.guideDest + 'nav.js',
        js,
        error => {
            if (error) {
                log(error);
            }
        }
    );
}

module.exports = writeNavigation;
