'use strict';

const { fs, path } = require('../utils/common-utils.js');
const BasePlugin = require('./base-plugin.js');

class PluginManager {
    constructor(baseConfig, projectRoot) {
        this.baseConfig = baseConfig;
        this.projectRoot = projectRoot;
    }

    init() {
        const enabledPlugins = this.baseConfig.enabledPlugins;

        if (!Array.isArray(enabledPlugins) || enabledPlugins.length === 0) {
            return [];
        }

        return enabledPlugins
            .filter(plugin => plugin && plugin.name)
            .map(plugin => this.runPlugin(plugin))
            .filter(Boolean);
    }

    runPlugin(plugin) {
        try {
            const pluginPath = this.resolvePluginPath(plugin.name);
            const PluginClass = require(pluginPath);
            const pluginInstance = new PluginClass(this.baseConfig, plugin.options || {});

            if (!(pluginInstance instanceof BasePlugin)) {
                throw new TypeError(`Plugin does not extend basePlugin: ${plugin.name}`);
            }

            pluginInstance.init();

            return this.buildPluginPage(pluginInstance, plugin.name);
        } catch (error) {
            console.error(`Error running plugin: ${plugin.name}`, error.message);
            return null;
        }
    }

    resolvePluginPath(pluginName) {
        const customPath = path.join(this.baseConfig.customPluginsPath, pluginName, 'index.js');

        if (this.baseConfig.customPluginsPath && fs.existsSync(customPath)) {
            return customPath;
        }

        const builtInPath = path.join(this.projectRoot, 'src/plugins', pluginName, 'index.js');

        if (fs.existsSync(builtInPath)) {
            return builtInPath;
        }

        throw new Error(`Plugin file does not exist for "${pluginName}".`);
    }

    buildPluginPage(pluginInstance, pluginName) {
        const config = pluginInstance.getConfiguration();

        if (!config || !config.id || !config.target || !config.title) {
            throw new Error(`Plugin "${pluginName}" returned invalid configuration.`);
        }

        return {
            id: config.id,
            title: config.title,
            src: '',
            target: path.join(this.baseConfig.guideDest, config.target),
            type: config.type || 'plugin',
            icon: config.icon || 'plug-16',
            content: {
                sections: [{
                    content: pluginInstance.getContent(),
                    class: ''
                }],
                toc: pluginInstance.getToc()
            },
            subPages: []
        };
    }
}

module.exports = PluginManager;
