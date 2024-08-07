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
        const template = fs.readFileSync(path.join(__dirname, 'templates/template.mustache'), 'utf-8');
        const htmlContent = mustache.render(template, {data: 'data from plugin:' + this.filePath});

        return htmlContent;
    }
}

module.exports = dummyPlugin;
