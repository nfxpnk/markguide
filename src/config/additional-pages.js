'use strict';

const { fs, path, log, c } = require('../utils/common-utils.js');

function getAdditionalPages(templates, dest, indexSrc) {
    let additionalPages = [];

    additionalPages.push({
        id: 'index',
        title: 'About',
        src: indexSrc,
        target: path.join(dest, '/index.html'),
        type: 'about',
        icon: 'info-16',
        subPages: []
    });

    return additionalPages;
}

module.exports = getAdditionalPages;
