'use strict';

const { fs, path, log, c } = require('./common-utils.js');

const mustache = require('mustache');
const inline = require('./template-helpers/inline.js');

const prepareView = function(config, markguideConfig, subPages) {
    this.projectInfo = {
        name: markguideConfig.projectInfo.name,
        version: markguideConfig.projectInfo.version
    };

    this.title = config.title;
    this.content = config.content;
    this.type = config.type;
    this.icon = config.icon; // Icon in page header
    this.src = config.src;
    this.subPages = subPages.subPages; // Aside navigation pages tree

    this.projectStyles = markguideConfig.projectStyles;
    this.projectScripts = markguideConfig.projectScripts;
};

prepareView.prototype.inline = () => (text, render) => inline(text, render);

module.exports = function init(markguideConfig, subPages) {
    const view = config => new prepareView(config, markguideConfig, subPages);

    const cachedTemplates = {
        'component': fs.readFileSync(markguideConfig.templates.component, 'utf8'),
        'guide': fs.readFileSync(markguideConfig.templates.guide, 'utf8')
    };

    const getCachedTemplates = type => {
        switch (type) {
            case 'guide':
            case 'plugin':
                return cachedTemplates.guide;
            case 'component':
            case 'container':
                return cachedTemplates.component;
            default:
                return fs.readFileSync(markguideConfig.templates[type], 'utf8');
        }
    };

    const cachePartials = partials => {
        let partialsStrings = {};

        Object.keys(partials).forEach(function(partial) {
            partialsStrings[partial] = fs.readFileSync(partials[partial], 'utf8');
        });

        return partialsStrings;
    };

    const cachedPartials = cachePartials(markguideConfig.partials);

    /**
     * Prepare data and write file to destination.
     * @private
     * @param {object} config - config object with templates and data
     * @return {Promise<string>}
     */
    const writePage = function(config) {
        return new Promise(
            (resolve, reject) => {
                fs.writeFile(
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
                )}
        );
    };

    return { writePage };
};
