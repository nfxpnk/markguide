'use strict';

const { fs, path, log, c } = require('./utils/common-utils.js');

const mustache = require('mustache');

let cachedContent = {};

const isContentChanged = (filePath, content) => {
    if (filePath === undefined) {
        return true;
    }

    if (content !== cachedContent[filePath]) {
        cachedContent[filePath] = content;
        return true;
    } else {
        return false;
    }
};

module.exports = function(markguideConfig, projectTree) {
    // Utils
    const normalizePath = require('./utils/normalize-path.js');
    const renderedPageContent = require('./models/page-content.js');

    const writePage = require('./utils/write-page.js')(markguideConfig, projectTree).writePage;

    /**
     * Walk though documented files in project and generate particular page (if path specified)
     * or full docset if no path provided.
     * @public
     * @param {string} [filePath] - path to file. If no string provided or function is passed this build all components
     * @return {Promise<string>}
     */
    function buildComponent(filePath) {
        filePath = normalizePath(filePath);
        let docSet = [];

        function traverseDocumentedTree(components, filePath) {
            components.forEach(component => {
                const isMakeAllComponents = filePath === undefined;
                const isFileInConfig = isMakeAllComponents ? true : filePath === component.src;
                const isFile = component.target;

                if (isFile && isFileInConfig) {
                    let pageContent;
                    let tableOfContent;

                    if (component.src !== '') {
                        const page = renderedPageContent(component.src, {'title': component.title});
                        pageContent = page.content;
                        tableOfContent = page.toc;
                    }

                    const content = {
                        documentation: pageContent,
                        toc: tableOfContent
                    };

                    if (isContentChanged(filePath, content.documentation)) {
                        docSet.push({
                            id: component.id,
                            title: component.title,
                            target: component.target,
                            //template: component.template,
                            type: component.type,
                            icon: component.icon,
                            src: component.src,
                            content: content
                        });
                    }

                    if (!isMakeAllComponents) {
                        return;
                    }
                }

                if (component.subPages.length) {
                    traverseDocumentedTree(component.subPages, filePath);
                }
            });
        }

        traverseDocumentedTree(projectTree.subPages, filePath);

        //docSet.forEach(ds => {console.log(ds);});

        return Promise.all(docSet.map(writePage));
    }

    return { buildComponent };
};
