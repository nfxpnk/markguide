'use strict';

const { fs, path, log, c } = require('../utils/common-utils.js');

// Get the current working directory as the project root
const projectRoot = process.cwd();

const fillTemplatesConfig = (templatesConfig, internalTemplatesPath, name) => {
    let templates = {};

    fs.readdirSync(path.join(__dirname, internalTemplatesPath)).forEach(item => {
        // Exclude all other files
        if (path.extname(item) === '.mustache') {
            templates[path.basename(item, '.mustache')] = '';
        }
    });

    Object.keys(templates).forEach(template => {
        if (templatesConfig !== undefined && Object.hasOwnProperty.call(templatesConfig, template)) {
            const templatePath = templatesConfig[template];
            if (fs.existsSync(templatePath)) {
                templates[template] = templatePath;
                return;
            } else {
                log(c.yellow('Warning: ') +
                    '"' + template + ' (' + templatePath + ')" ' + name + ' is declared, but file not found. ' +
                    'Internal partial used for this include.');
            }
        }
        templates[template] = path.join(__dirname, internalTemplatesPath, template + '.mustache');
    });

    return templates;
};

// Find and load the configuration
function findConfig(config) {
    // Check if a configuration object was passed directly
    if (config !== undefined) {
        if (typeof config === 'object') {
            return config;
        }

        const configPath = path.join(projectRoot, config);

        if (fs.existsSync(configPath)) {
            return require(configPath);
        }
    }

    log(c.red('Error: ') + 'Could not find configuration. ' + configPath + ' Please pass path to config ' +
        'or raw config object into markguide.withConfig()');

    return undefined;
}


function getProjectInfo(config) {
    const pkg = require(path.join(projectRoot, 'package.json'));
    let projectName = 'markguide';

    if (config.projectInfo !== undefined && config.projectInfo.name) {
        projectName = config.projectInfo.name;
    } else {
        if (!pkg.name) {
            log(c.yellow('Warning: ') +
                'Neither "projectName" in markguide, nor "name" in package.json is declared. ' +
                '"markguide" name used instead.');
        } else {
            projectName = pkg.name.replace('/', '-'); // fix namespaced project names
        }
    }

    return {
        name: projectName,
        version: pkg.version || ''
    };
}

function getBaseConfig(configRaw) {
    const config = findConfig(configRaw);
    if (config === undefined) {
        return { isCorrupted: true };
    }

    const baseMandatory = require('./config-mandatory.js')(config);

    if (baseMandatory.isCorrupted) {
        return { isCorrupted: true };
    }

    const templates = { templates: fillTemplatesConfig(config.templates, '../views/templates/', 'template') };

    const partials = { partials: fillTemplatesConfig(config.partials, '../views/includes/partials/', 'partial') };

    const projectInfo = { projectInfo: getProjectInfo(config) };

    const additionalPages = {
        additionalPages: [{
            id: 'index',
            title: 'About',
            src: path.join('./README.md'), // get absolute path ?
            target: path.join(baseMandatory.guideDest, '/index.html'),
            type: 'page',
            icon: 'info-16',
            subPages: []
        }]
    };

    const pluginsPages = {
         pluginsPages: initPlugins(Object.assign({}, baseMandatory))
    };

    console.log(baseMandatory);

    return Object.assign({}, baseMandatory, templates, additionalPages, partials, projectInfo, pluginsPages);
}

function initPlugins(baseMandatory) {
    if(baseMandatory.enabledPlugins === undefined) {
        return [];
    }

    const basePlugin = require('../models/base-plugin.js');

    const plugins = [];

    baseMandatory.enabledPlugins.forEach(plugin => {
        let pluginPath = path.join(baseMandatory.customPluginsPath, plugin.name, 'index.js');

        if(fs.existsSync(pluginPath) === false) {
            pluginPath = path.join(projectRoot, 'src/plugins', plugin.name, 'index.js');

            if(fs.existsSync(pluginPath) === false) {
                throw new Error(`Plugin file does not exist: ${pluginPath}`);
            }
        }

        const pluginClass = require(pluginPath);


        const pluginInstance = new pluginClass(baseMandatory, plugin.options);

        if (!(pluginInstance instanceof basePlugin)) {
            throw new Error(`Plugin does not extend basePlugin: ${pluginInstance.constructor.name}`);
        }
        try {
            pluginInstance.init();

            const config = pluginInstance.getConfiguration();
            const content = pluginInstance.getContent();
            const toc = pluginInstance.getToc();

            plugins.push({
                id: config.id,
                title: config.title,
                src: '',
                target: path.join(baseMandatory.guideDest, config.target),
                type: config.type,
                icon: config.icon,
                content: {
                    sections: [{
                        content: content
                    }], // TODO: redo this
                    toc: toc
                },
                subPages: []
            });
        } catch (error) {
            console.error(`Error running plugin: ${pluginInstance.constructor.name}`, error);
        }
    });

    return plugins;
}

module.exports = getBaseConfig;
