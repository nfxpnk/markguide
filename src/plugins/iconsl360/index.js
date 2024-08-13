'use strict';

const { fs, path, log, c } = require('../../utils/common-utils.js');
const mustache = require('mustache');
const basePlugin = require('../../models/base-plugin.js');

class iconsl360Plugin extends basePlugin {
    constructor(config, options) {
        super(config, options);

        this.baseDir = __dirname;

        // Path to the folder with icons files
        if(path.isAbsolute(options.filePath)) {
            this.filePath = options.filePath;
        } else {
            this.filePath = path.join(config.projectStaticFiles, options.filePath);
        }
    }

    init() {
        // Optional initialization logic
    }

    getConfiguration() {
        return {
            id: 'iconsl360',
            title: 'Icons',
            target: '/iconsl360.html',
            type: 'plugin',
            icon: 'icons'
        };
    }

    getToc() {
        const toc = [];

        const heading = {
            text: 'test',
            depth: 2,
            escapedText: 'test'
        };

        toc.push(heading);

        return toc;
    }

    getContent() {
        const template = this.getTemplate('templates/template.mustache');
        const itemPartial = this.getTemplate('templates/item.mustache');

        const icons = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));

        const htmlContent = mustache.render(template, { page: this.getConfiguration(), icons: icons }, {item: itemPartial});

        return htmlContent;
    }
}

module.exports = iconsl360Plugin;
