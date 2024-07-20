#!/usr/bin/env node
'use strict';

const fs = require('fs');
const args = process.argv[2];

if (typeof args !== 'string') {
    console.error('Error: no arguments');
    process.exit(0);
}

const parseOption = arg => arg.split(/=/);
const arg = parseOption(args);

try {
    switch (arg[0]) {
        case '--build':
        case '-b':
            require('../src/markguide.js').withConfig(arg[1]).buildAll();
            break;
        case '--version':
        case '-v':
            console.log('markguide ' + require('../package.json').version);
            break;
        case '--help':
        default:
            const doc = fs.readFileSync('./doc.txt', 'utf8');
            console.log('\n' + doc);
    }
} catch (e) {
    if (e.code === 'ENOENT') {
        console.error('Error: no such file or directory "' + e.path + '"');
    } else {
        console.error('Error: ' + e.message);
    }
    process.exit(1);
}
