'use strict';

const { fs, path, log, c } = require('../utils/common-utils.js');

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

const getConfig = require('./find-config');

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
    const config = getConfig(configRaw);
    if (config === undefined) {
        return { isCorrupted: true };
    }

    const baseMandatory = require('./config-mandatory.js')(config);

    if (baseMandatory.isCorrupted) {
        return { isCorrupted: true };
    }

    const baseOptional = require('./config-optional.js')(config);

    const templates = { templates: fillTemplatesConfig(config.templates, '../views/templates/', 'template') };

    const partials = { partials: fillTemplatesConfig(config.partials, '../views/includes/partials/', 'partial') };

    const projectInfo = { projectInfo: getProjectInfo(config) };

    const additionalPages = {
        additionalPages: [{
            id: 'index',
            title: 'About',
            src: path.join('./README.md'),
            target: path.join(baseMandatory.guideDest, '/index.html'),
            type: 'about',
            icon: 'info-16',
            subPages: []
        }]
    };

    const pluginsPages = {
         pluginsPages: initPlugins(baseMandatory)
    };

    return Object.assign({}, baseMandatory, baseOptional, templates, additionalPages, partials, projectInfo, pluginsPages);
}

function initPlugins(baseMandatory) {
    const basePlugin = require('../models/base-plugin.js');

    const plugins = [];

    // get this from configuration
    const enabledPlugins = [
        {
            name: 'colors',
            options: { filePath: 'H:/github/markguide/_example/scss-source/configuration/_colors.scss' }
        },
        {
            name: 'icons',
            options: { iconsFolder: 'H:/github/markguide/_example/' }
        }
    ];

    enabledPlugins.forEach(plugin => {
        const pluginClass = require(path.join('../plugins', plugin.name, 'index.js'));
        const pluginInstance = new pluginClass(plugin.options);

        if (!(pluginInstance instanceof basePlugin)) {
            throw new Error(`Plugin does not extend basePlugin: ${pluginInstance.constructor.name}`);
        }
        try {
            pluginInstance.init();

            const config = pluginInstance.getConfiguration();
            const content = pluginInstance.getContent();

            plugins.push({
                id: config.id,
                title: config.title,
                src: '',
                target: path.join(baseMandatory.guideDest, config.target),
                type: config.type,
                icon: config.icon,
                content: {documentation: content, toc: 'TOC'},
                subPages: []
            });
        } catch (error) {
            console.error(`Error running plugin: ${pluginInstance.constructor.name}`, error);
        }
    });

    return plugins;
}

module.exports = getBaseConfig;
