'use strict';

const { fs, path, log, c } = require('../../utils/common-utils.js');
const mustache = require('mustache');
const basePlugin = require('../../models/base-plugin.js');

class typographyPlugin extends basePlugin {
    constructor(config, options) {
        super(config, options);

        this.baseDir = __dirname;

        this.fonts = config.projectFonts.map(font => ({
            filename: font.filename,
            family: font.properties.family,
            style: font.properties.style,
            weight: font.properties.weight
        }));

        this.alphabet = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
        ];

        this.digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    }

    init() {
        // Optional initialization logic
    }

    getConfiguration() {
        return {
            id: 'typography',
            title: 'Typography',
            target: '/typography.html',
            type: 'plugin',
            icon: 'typography-16'
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
        return this.generateTypographyPage(this.fonts);
    }

    generateTypographyPage(fonts) {
        const template = this.getTemplate('templates/template.mustache');
        const htmlContent = mustache.render(template, {
            page: this.getConfiguration(),
            alphabet: this.alphabet,
            digits: this.digits,
            fonts: fonts
        });

        return htmlContent;
    }
}

module.exports = typographyPlugin;
