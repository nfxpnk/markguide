'use strict';

const fs = require('fs');
const path = require('path');
const log = require('fancy-log');
const c = require('ansi-colors');
const mustache = require('mustache');
const { basePlugin } = require('H:/github/markguide/src/markguide.js');

class dummyPlugin extends basePlugin {
    constructor(config, options) {
        super(config, options);

        this.baseDir = __dirname;

        this.filePath = options.filePath;
    }

    init() {
        // Optional initialization logic
    }

    getConfiguration() {
        return {
            id: 'dummy',
            title: 'Dummy',
            target: '/dummy.html',
            type: 'plugin',
            icon: 'book-16'
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
        const htmlContent = mustache.render(template, {page: this.getConfiguration(), data: 'data from plugin:' + this.filePath});

        return htmlContent;
    }
}

module.exports = dummyPlugin;
