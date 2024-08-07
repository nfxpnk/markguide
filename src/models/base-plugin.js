'use strict';

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
}

module.exports = basePlugin;
