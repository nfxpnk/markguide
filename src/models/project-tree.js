'use strict';

const { fs, path, log, c } = require('../utils/common-utils.js');

let excludedSassFiles;
let excludedDirs;
let guideDest;
let templates;


function isDocumented(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const docCommentPattern = /\/\*md(\r\n|\n)(((\r\n|\n)|.)*?)\*\//g;
    const match = docCommentPattern.exec(fileContent);

    // Check if a match is found and the content inside the block is not empty
    const hasDocumentation = match !== null && match[2].trim().length > 0;

    return hasDocumentation;
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
        noDocumentation: noDocumentation,
        subPages: []
    };
}

function categoryConfig(id, title) {
    return {
        id: id,
        title: title,
        type: 'category',
        icon: 'file-directory-fill-16',
        subPages: []
    };
}

/**
 * @typedef {Object} markguideComponentObject
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
 * @param {object} markguideConfig
 * @return {markguideComponentObject} tree of nodes
 */
function makeProjectTree(markguideConfig) {
    excludedSassFiles = markguideConfig.excludedSassFiles;
    excludedDirs = markguideConfig.excludedDirs;
    guideDest = markguideConfig.guideDest;
    templates = markguideConfig.templates;

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
     * @param {string} categoryName - category name that will be used as component prefix. 'markguide' as start point,
     * directory name in all future cases.
     */
    function findComponents(url, config, categoryName) {
        const dir = fs.readdirSync(url);
        dir.forEach(res => {
            let name = res;
            let target = path.join(url, name);
            let resource = fs.statSync(target);

            if (resource.isFile()) {
                let title = path.basename(name);
                const isSass = path.extname(name) === '.scss';

                if (isSass) {
                    docSet.coverage.all++;
                }

                if (isSass && !isExcludedFile(name)) {
                    const isDocumentedValue = isDocumented(target);
                    let titleId = path.basename(name, '.scss').replace(/^_/i, '');
                    const id = categoryName + titleId;

                    if(isDocumentedValue) {
                        docSet.coverage.covered++;
                    } else {
                        docSet.coverage.notcovered++;
                    }

                    if (isDocumentedValue || path.basename(name).startsWith('_')) {
                        config.push(pageConfig(id, title, target, !isDocumentedValue));
                    }
                }

                if (path.extname(name) === '.md' && !/^README\.md/.test(categoryName + name)) { // this is hacky way
                    // to exclude root README.md
                    const id = categoryName + 'doc-' + path.basename(name, '.md');
                    config.push(pageConfig(id, title, target, false, true));
                }
            } else if (resource.isDirectory() && !isExcludedDirectory(name)) {
                const id = 'section-' + path.basename(name);
                config.push(categoryConfig(id, name));
                findComponents(target, config[config.length - 1].subPages, categoryName + name + '-');
            }
        });
    }

    findComponents(markguideConfig.guideSrc, docSet.subPages, '');
    removeEmptyCategories(docSet.subPages);

    //console.log(docSet.coverage.all, ' : ', docSet.coverage.all - docSet.coverage.notcovered);

    if (markguideConfig.additionalPages.length) {
        markguideConfig.additionalPages.forEach(page => docSet.subPages.unshift(page));
    }

    return docSet;
}

module.exports = makeProjectTree;
