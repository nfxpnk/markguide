#!/usr/bin/env node
'use strict';

const parseOption = arg => arg.split(/=/);
const arg = parseOption(process.argv[2]);

try {
    switch (arg[0]) {
        case '--build':
        case '-b':
            require('../app/markguide.js').withConfig(arg[1]).buildAll();
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
