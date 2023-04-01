'use strict';

const fs = require('fs');
const path = require('path');

let excludedSassFiles;
let excludedDirs;
let guideDest;
let templates;

function isDocumented(filePath, arr) {
    // const file = fs.readFileSync(filePath, 'utf8');
    // const docComment = /\/\*md(\r\n|\n)(((\r\n|\n)|.)*?)\*\//g;
    // const exec = docComment.exec(file);

    // return !!(exec !== null && exec[2].trim());
    if (!arr || !filePath) {
        return false;
    }

    return arr.includes(filePath.split('.')[0]);
}

/**
 * Traverse array of objects and removes those objects
 * which are categories and doesn't have any sub-pages
 * @param {Array} collection - array of objects
 */
function removeEmptyCategories(collection) {
    for (let i = collection.length - 1; i >= 0; i--) {
        if (collection[i].type === 'category') {
            if (collection[i].subPages.length) {
                removeEmptyCategories(collection[i].subPages);
            }

            if (collection[i].subPages.length === 0) {
                collection.splice(i, 1);
            }
        }
    }
}

const isExcludedFile = name => excludedSassFiles.test(name);
const isExcludedDirectory = name => excludedDirs.test(name);

function pageConfig(id, title, target, noDocumentation, isDocs) {
    return {
        id: id,
        title: title,
        type: isDocs ? 'guide' : /^l-/i.test(title) ? 'container' : 'component', // TODO: configuration
        icon: isDocs ? 'markdown-16' : /^l-/i.test(title) ? 'file-16' : 'file-code-16', // TODO: configuration
        src: target,
        target: guideDest + id + '.html',
        template: isDocs ? templates.docs : templates.component,
        isDeprecated: /deprecated/.test(title),
        noDocumentation: noDocumentation,
        subPages: []
    };
}

function categoryConfig(title) {
    return {
        title: title,
        type: 'category',
        icon: 'file-directory-fill-16',
        isDeprecated: false,
        subPages: []
    };
}

/**
 * @typedef {Object} atlasComponentObject
 * @property {string} title - title of resource [category|component|guide]
 * @property {string} type - type of resource [category|guide|component|container]
 * @property {string} [src] - source file of resource
 * @property {string} [target] - path to generated component html
 * @property {string} [template] - template type that used for html
 * @property {array} subPages - list of contained resources
 */
/**
 * Subtract documented components tree from project tree.
 * This will be used as data for pages generation and as high availability project map to prevent unnecessary direct
 * work with FS.
 * @private
 * @param {object} atlasConfig
 * @return {atlasComponentObject} tree of nodes
 */
function makeProjectTree(atlasConfig) {
    excludedSassFiles = atlasConfig.excludedSassFiles;
    excludedDirs = atlasConfig.excludedDirs;
    guideDest = atlasConfig.guideDest;
    templates = atlasConfig.templates;

    let docSet = {
        'coverage': {
            'all': 0,
            'notcovered': 0
        },
        'subPages': []
    };

    /**
     * Traverse directories and generate components config
     * @param {string} url - components source
     * @param {object} config - base for generated config
     * @param {string} categoryName - category name that will be used as component prefix. 'atlas' as start point,
     * directory name in all future cases.
     */
    function findComponents(url, config, categoryName, mdFiles) {
        const dir = fs.readdirSync(url);
        dir.forEach(res => {
            let name = res;
            let target = path.join(url, name);
            let resource = fs.statSync(target);

            if (resource.isFile()) {
                const title = path.basename(name);
                const isSass = path.extname(name) === '.scss';
                if (isSass) {
                    docSet.coverage.all++;
                }

                if (isSass && !isDocumented(target, mdFiles) && !isExcludedFile(name)) {
                    docSet.coverage.notcovered++;
                    config.push(pageConfig(false, title, target, true, false));
                }
                if (path.extname(name) === '.md' && !/^README\.md/.test(categoryName + name)) { // this is hacky way
                    // to exclude root README.md
                    const id = categoryName + 'doc-' + path.basename(name, '.md');
                    config.push(pageConfig(id, title, target, false, true));
                }
            } else if (resource.isDirectory() && !isExcludedDirectory(name)) {
                config.push(categoryConfig(name));
                findComponents(target, config[config.length - 1].subPages, categoryName + name + '-', mdFiles);
            }
        });
    }

    let mdFiles = [];
    function findMd(url) {
        const dir = fs.readdirSync(url);

        dir.forEach(res => {
            let target = path.join(url, res);
            let resource = fs.statSync(target);

            if (resource.isFile()) {
                if (path.extname(res) === '.md') {
                    mdFiles.push(target.split('.')[0]);
                }
            } else if (resource.isDirectory() && !isExcludedDirectory(res)) {
                findMd(target);
            }
        });
    }

    findMd(atlasConfig.guideSrc);

    findComponents(atlasConfig.guideSrc, docSet.subPages, '', mdFiles);
    removeEmptyCategories(docSet.subPages);
    console.log(docSet.coverage.all,' : ', docSet.coverage.all - docSet.coverage.notcovered)

    if (atlasConfig.additionalPages.length) {
        atlasConfig.additionalPages.forEach(page => docSet.subPages.unshift(page));
    }

    return docSet;
}

module.exports = makeProjectTree;
