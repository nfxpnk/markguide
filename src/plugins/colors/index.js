'use strict';

const { fs, path, log, c } = require('../../utils/common-utils.js');
const mustache = require('mustache');
const basePlugin = require('../../models/base-plugin.js');

class colorsPlugin extends basePlugin {
    constructor(config, options) {
        super(config, options);

        this.baseDir = __dirname;

        if(path.isAbsolute(options.filePath)) {
            this.filePath = options.filePath;
        } else {
            this.filePath = path.join(config.guideSrc, options.filePath);
        }

    }

    init() {
        // Optional initialization logic
    }

    getConfiguration() {
        return {
            id: 'colors',
            title: 'Colors',
            target: '/colors.html',
            type: 'plugin',
            icon: 'paintbrush-16'
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
        const colors = this.readColorsFromFile(this.filePath);

        return this.generateColorsPage(colors);
    }

    readColorsFromFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const colorRegex = /\$([\w-]+):\s*(#[0-9a-fA-F]{3,6}|rgba?\(.+?\));/g;
        let match;
        const colors = [];

        while ((match = colorRegex.exec(content)) !== null) {
            colors.push({ name: match[1], value: match[2] });
        }

        return colors;
    }

    generateColorsPage(colors) {
        const template = this.getTemplate('templates/template.mustache');
        const htmlContent = mustache.render(template, {page: this.getConfiguration(), colors: colors});

        return htmlContent;
    }
}

module.exports = colorsPlugin;
