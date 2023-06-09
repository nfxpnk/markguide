'use strict';

const fs = require('fs');
const path = require('path');
const log = require('fancy-log');
const c = require('ansi-colors');
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
const getConfig = require('./config/findconfig');

function getProjectInfo(config) {
    const pkg = require(path.join(projectRoot, 'package.json'));
    let projectName = 'atlas';

    if (config.projectInfo !== undefined && config.projectInfo.name) {
        projectName = config.projectInfo.name;
    } else {
        if (!pkg.name) {
            log(c.yellow('Warning: ') +
                'Neither "projectName" in atlas, nor "name" in package.json is declared. ' +
                '"atlas" name used instead.');
        } else {
            projectName = pkg.name.replace('/', '-'); // fix namespaced project names
        }
    }

    return {
        name: projectName,
        version: pkg.version || ''
    };
}

// function getPartialsConfig(config) {
//     let partials = fillTemplatesConfig(config.partials, '../views/includes/partials/', 'partial');
//
//     Object.keys(partials).forEach(function(partial) {
//         partials[partial] = fs.readFileSync(partials[partial], 'utf8');
//     });
//
//     return partials;
// }

function getBaseConfig(configRaw) {
    const config = getConfig(configRaw);
    if (config === undefined) {
        return { isCorrupted: true };
    }
    const baseMandatory = require('./config/configmandatory.js')(config);
    if (baseMandatory.isCorrupted) {
        return { isCorrupted: true };
    }

    const baseOptional = require('./config/configoptional.js')(config);

    const templates = { templates: fillTemplatesConfig(config.templates, '../views/templates/', 'template') };

    const getIndexPageSource = require('./config/indexpagesource.js');

    const additionalPages = {
        additionalPages: require('./config/additionalpages.js')(
            templates.templates,
            baseMandatory.guideDest,
            getIndexPageSource(projectRoot, baseMandatory.guideSrc, baseOptional.indexPageSource)
        )
    };

    const partials = { partials: fillTemplatesConfig(config.partials, '../views/includes/partials/', 'partial') };

    const projectInfo = { projectInfo: getProjectInfo(config) };

    return Object.assign({}, baseMandatory, baseOptional, templates, additionalPages, partials, projectInfo);
}

module.exports = getBaseConfig;
