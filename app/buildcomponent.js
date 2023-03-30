'use strict';

const fs = require('fs');
const mustache = require('mustache');

let cachedContent = {};
const isContentChanged = (url, content) => {
    if (url === undefined) {
        return true;
    }
    if (content !== cachedContent[url]) {
        cachedContent[url] = content;
        return true;
    } else {
        return false;
    }
};

module.exports = function(atlasConfig, projectTree, writePage) {
    // Utils
    const normalizePath = require('./utils/normalizepath');
    const prepareContent = require('./utils/preparecontent')(
            atlasConfig,
            projectTree
        ).prepareContent;

    /**
     * Walk though documented files in project and generate particular page (if path specified)
     * or full docset if no path provided.
     * @public
     * @param {string} [url] - path to file. If no string provided or function is passed this build all components
     * @return {Promise<string>}
     */
    function buildComponent(url) {
        const source = normalizePath(url);
        let docSet = [];

        function traverseDocumentedTree(components, sourcePath) {
            components.forEach(component => {
                const isMakeAllComponents = sourcePath === undefined;
                const isFileInConfig = isMakeAllComponents ? true : sourcePath === component.src;
                const isFile = component.target;

                if (isFile && isFileInConfig) {
                    const content = prepareContent(component);
                    if (isContentChanged(sourcePath, content.documentation)) {
                        docSet.push({
                            id: component.id,
                            title: component.title,
                            target: component.target,
                            //template: component.template,
                            type: component.type,
                            icon: component.icon,
                            isDeprecated: component.isDeprecated,
                            content: content
                        });
                    }

                    if (!isMakeAllComponents) {
                        return;
                    }
                }

                if (component.subPages.length) {
                    traverseDocumentedTree(component.subPages, sourcePath);
                }
            });
        }

        let tpl = `
const asideNav = \`;;;;;;\`;

document.addEventListener('DOMContentLoaded', function () {
    const asideNavContainer = document.getElementById('js-atlas-navigation');
    asideNavContainer.innerHTML = asideNav;
});
`;

        traverseDocumentedTree(projectTree.subPages, source);
        console.log('Writing navigation file....');

        let js = mustache.render(
            fs.readFileSync(atlasConfig.partials.navigation, 'utf8'),
            projectTree,
            {
                "navigation": fs.readFileSync(atlasConfig.partials.navigation, 'utf8')
            }
        );

        js = tpl.replace(';;;;;;', js);

        fs.writeFileSync(
            atlasConfig.guideDest + 'nav.js',
            js,
            error => {
                if (error) {
                    console.log(error);
                }
            }
        );

        return Promise.all(docSet.map(writePage));
    }

    return { buildComponent };
};
