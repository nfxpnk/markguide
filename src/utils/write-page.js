'use strict';

const fs = require('fs');
const mustache = require('mustache');
const inline = require('./template-helpers/inline.js');

const prepareView = function(config, projectInfo, subPages) {
    this.projectInfo = {
        name: projectInfo.name,
        version: projectInfo.version
    };
    this.title = config.title;
    this.content = config.content;
    this.type = config.type;
    this.icon = config.icon; // Icon in page header
    this.subPages = subPages.subPages; // Aside navigation pages tree
};

prepareView.prototype.inline = () => (text, render) => inline(text, render);

module.exports = function init(atlasConfig, subPages) {
    const view = config => new prepareView(config, atlasConfig.projectInfo, subPages);

    const cachedTemplates = {
        'component': fs.readFileSync(atlasConfig.templates.component, 'utf8'),
        'guide': fs.readFileSync(atlasConfig.templates.guide, 'utf8')
    };

    const getCachedTemplates = type => {
        switch (type) {
            case 'guide':
                return cachedTemplates.guide;
            case 'component':
            case 'container':
                return cachedTemplates.component;
            default:
                return fs.readFileSync(atlasConfig.templates[type], 'utf8');
        }
    };

    const cachePartials = partials => {
        let partialsStrings = {};

        Object.keys(partials).forEach(function(partial) {
            partialsStrings[partial] = fs.readFileSync(partials[partial], 'utf8');
        });

        return partialsStrings;
    };

    const cachedPartials = cachePartials(atlasConfig.partials);

    /**
     * Prepare data and write file to destination.
     * @private
     * @param {object} config - config object with templates and data
     * @return {Promise<string>}
     */
    const writePage = function(config) {
        return new Promise(
            (resolve, reject) => fs.writeFile(
                config.target,
                mustache.render(
                    getCachedTemplates(config.type),
                    view(config),
                    cachedPartials
                ),
                error => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve('Page saved');
                    }
                }
            )
        );
    };

    return { writePage };
};
