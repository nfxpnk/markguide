'use strict';

const { fs, path, log, c } = require('../utils/common-utils.js');

let excludedSassFiles;
let excludedDirs;
let guideDest;
let templates;

/**
 * Checks if the specified file contains a non-empty documentation comment block.
 *
 * The function looks for a block comment starting with /*md and ending with /.
 * It returns true if such a block is found and the content inside the block is not empty.
 *
 * @param {string} filePath - The path to the file to check for documentation.
 * @returns {boolean} - Returns true if a non-empty documentation block is found, otherwise false.
 */
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
 *
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
    let type = 'component';
    let icon = 'file-code-16';

    if (isDocs) {
        type = 'guide';
        icon = 'markdown-16';
    } else if (/^l-/i.test(title)) {
        type = 'container';
        icon = 'file-16';
    }

    return {
        id: id,
        title: title,
        type: type, // TODO: configuration
        icon: icon, // TODO: icon for each type should be in config
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
            'covered': 0,
            'notcovered': 0
        },
        'subPages': []
    };

    /**
     * Traverse directories and generate components config
     * @param {string} directoryPath - components source
     * @param {object} config - base for generated config
     * @param {string} categoryName - category name that will be used as component prefix. 'markguide' as start point,
     * directory name in all future cases.
     */
    function findComponents(directoryPath, config, categoryName) {
        const items = fs.readdirSync(directoryPath);

        const directories = [];
        const files = [];

        // Separate directories and files
        items.forEach(item => {
        const itemPath = path.join(directoryPath, item);
            if (fs.statSync(itemPath).isDirectory()) {
                directories.push(item);
            } else {
                files.push(item);
            }
        });

        // Concatenate directories and files
        const sortedItems = directories.concat(files);

        sortedItems.forEach(item => {
            let name = item;
            let target = path.join(directoryPath, name);
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
    //removeEmptyCategories(docSet.subPages);

    //console.log(docSet.coverage.all, ' : ', docSet.coverage.all - docSet.coverage.notcovered);

    if (markguideConfig.additionalPages && markguideConfig.additionalPages.length > 0) {
        markguideConfig.additionalPages.forEach(page => docSet.subPages.unshift(page));
    }

    if (markguideConfig.pluginsPages && markguideConfig.pluginsPages.length > 0) {
        markguideConfig.pluginsPages.forEach(page => docSet.subPages.unshift(page));
    }

    return docSet;
}

module.exports = makeProjectTree;
