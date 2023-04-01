'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function(atlasConfig, projectTree) {
    const renderedPageContent = require(path.resolve(__dirname, '../models/pagecontent.js'));

    // Prepare guide page content model depending on component type
    function prepareContent(component) {
        let content;
        let tableOfContent;
        let stat;
        let page;
        let path;

        if (component.src !== '') { // could be stat pages or custom defined file
            page = renderedPageContent(component.src, {'title': component.title});
            content = page.content;
            tableOfContent = page.toc;
            path = component.src.split('\\scss\\')[1];
        }

        switch (component.type) {
            case 'component':
            case 'container':
                break;
            case 'about':
                stat = {
                    'projectName': atlasConfig.projectInfo.name
                };
                break;
        }

        return {
            documentation: content,
            toc: tableOfContent,
            path: path
        };
    }

    return { prepareContent };
};
