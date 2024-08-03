'use strict';

const fs = require('fs');
const log = require('fancy-log');
const c = require('ansi-colors');

const icons = [
    'book-16',
    'code-16',
    'file-16',
    'file-code-16',
    'file-directory-fill-16',
    'hash-16',
    'info-16',
    'link-16',
    'link-external-16',
    'markdown-16',
    'paintbrush-16',
    'screen-full-16',
    'screen-normal-16',
    'search-16',
    'typography-16',
    'x-circle-16',
    'confluence',
    'icons'
];

const iconsFile = '../../src/views/includes/partials/icons.mustache';

const header = '<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\r\n';
const footer = '</svg>\r\n';

let html = header;

let iconsPath = './octicons/octicons/icons';
if (!fs.existsSync(iconsPath)) {
    iconsPath = './octicons/icons';
}

if (!fs.existsSync(iconsPath)) {
    log(`Can't find icons 'octicons' folder.`);
    log(`'git clone git@github.com:primer/octicons.git' into ./helpers/icons/octicons`);
    process.exit();
}

for (const icon of icons) {
    let iconFile = `${iconsPath}/${icon}.svg`;

    if (!fs.existsSync(iconFile)) {
        iconFile = `./custom/${icon}.svg`;
    }

    if (!fs.existsSync(iconFile)) {
        log(`Icon ` + c.red(iconFile) + ` doesn't exist`);
        continue;
    }

    let code = fs.readFileSync(iconFile, 'utf8');
    code = code.replace('<svg xmlns="http://www.w3.org/2000/svg"', `\t<symbol id="${icon}"`);
    code = code.replace(/(width|height)="\d+" /gmi, '');
    code = code.replace('</svg>', '</symbol>');

    if (code.indexOf('fill="currentColor"') === -1 && code.indexOf('fill = "currentColor"') === -1) {
        code = code.replace('<path', '<path fill="currentColor"');
    }
    code += '\r\n';
    html += code;

    log(`Icon ` + c.green(iconFile) + ` added to template content`);
}
html += footer;

try {
    fs.writeFileSync(iconsFile, html);
    log(`File ` + c.cyan(iconsFile) + ` written successfully`);
} catch (err) {
    console.error(err);
}
