'use strict';

class BasePlugin {
    constructor(options) {
        if (new.target === BasePlugin) {
            throw new TypeError(`Cannot construct BasePlugin instances directly`);
        }
        if (typeof this.init !== 'function') {
            throw new TypeError(`Must override method 'init'`);
        }
        if (typeof this.run !== 'function') {
            throw new TypeError(`Must override method 'run'`);
        }
        this.options = options;
    }

    init() {
        throw new Error(`init() must be implemented`);
    }

    run() {
        throw new Error(`run() must be implemented`);
    }
}

module.exports = BasePlugin;
