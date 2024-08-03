'use strict';

const { fs, path, log, c } = require('../../utils/common-utils.js');
const mustache = require('mustache');
const basePlugin = require('../../models/base-plugin.js');

class typographyPlugin extends basePlugin {
    constructor(config, options) {
        super(config, options);

        this.fonts = config.projectFonts.map(font => ({
            filename: font.filename,
            family: font.properties.family,
            style: font.properties.style,
            weight: font.properties.weight
        }));
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
            icon: 'hash-16'
        };
    }

    getContent() {
        return this.generateTypographyPage(this.fonts);
    }

    generateTypographyPage(fonts) {
        const template = fs.readFileSync(path.join(__dirname, 'templates/template.mustache'), 'utf-8');
        const htmlContent = mustache.render(template, { fonts });

        return htmlContent;
    }
}

module.exports = typographyPlugin;
