'use strict';

const { fs, path, log, c } = require('../../utils/common-utils.js');
const mustache = require('mustache');
const basePlugin = require('../../models/base-plugin.js');

class iconsPlugin extends basePlugin {
    constructor(options) {
        super(options);
    }

    init() {
        // Optional initialization logic
    }

    getConfiguration() {
        return {
            id: 'icons',
            title: 'Icons',
            target: '/icons.html',
            type: 'guide',
            icon: 'hash-16',
            options: { filePath: 'H:/github/markguide/_example/scss-source/configuration/_colors.scss' }
        };
    }

    getContent() {
        return 'ICONS CONTENT';
    }
}

module.exports = iconsPlugin;
