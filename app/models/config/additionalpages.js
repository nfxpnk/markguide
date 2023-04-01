'use strict';

const path = require('path');

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
