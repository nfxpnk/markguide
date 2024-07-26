'use strict';

const { fs, path, log, c } = require('../../utils/common-utils.js');
const mustache = require('mustache');
const basePlugin = require('../../models/base-plugin.js');

class colorsPlugin extends basePlugin {
    constructor(options) {
        super(options);
    }

    init() {
        // Optional initialization logic
    }

    getConfiguration() {
        return {
            id: 'colors',
            title: 'Colors',
            target: '/colors.html',
            type: 'guide',
            icon: 'paintbrush-16'
        };
    }

    getContent() {
        const colors = this.readColorsFromFile(this.options.filePath);

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
        const template = fs.readFileSync(path.join(__dirname, 'templates/template.mustache'), 'utf-8');
        const htmlContent = mustache.render(template, {colors: colors});

        return htmlContent;
    }
}

module.exports = colorsPlugin;
