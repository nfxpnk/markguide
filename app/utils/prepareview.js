'use strict';

module.exports = function init(projectInfo, subPages) {
    const inline = require('./templateHelpers/inline.js');

    const View = function(config) {
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

    View.prototype.inline = () => (text, render) => inline(text, render);

    return { view: config => new View(config) };
};
