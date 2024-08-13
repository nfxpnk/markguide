'use strict';

const { fs, path, log, c } = require('../utils/common-utils.js');

class basePlugin {
    constructor(config, options) {
        if (new.target === basePlugin) {
            throw new TypeError(`Cannot construct basePlugin instances directly`);
        }
        if (this.init === basePlugin.prototype.init) {
            throw new TypeError(`Must override method 'init'`);
        }
        if (this.getConfiguration === basePlugin.prototype.getConfiguration) {
            throw new TypeError(`Must override method 'getConfiguration'`);
        }
        if (this.getContent === basePlugin.prototype.getContent) {
            throw new TypeError(`Must override method 'getContent'`);
        }
        this.options = options;
        this.baseDir = __dirname;
    }

    init() {
        throw new Error(`init() must be implemented`);
    }

    getConfiguration() {
        throw new Error(`getConfiguration() must be implemented`);
    }

    getToc() {
        throw new Error(`getToc() must be implemented`);
    }

    getContent() {
        throw new Error(`getContent() must be implemented`);
    }

    getTemplate(filePath) {
        try {
            const templatePath = path.join(this.baseDir, filePath);

            return fs.readFileSync(templatePath, 'utf8');
        } catch (error) {
            log.error(`Error reading template file: ${error.message}`);
            return '';
        }
    }
}

module.exports = basePlugin;
