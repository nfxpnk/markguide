#!/usr/bin/env node
'use strict';

const parseOption = arg => arg.split(/=/);
const arg = parseOption(process.argv[2]);

try {
    switch (arg[0]) {
        case '--build':
        case '-b':
            require('../app/markguide').withConfig(arg[1]).buildAll();
            break;
        case '--version':
        case '-v':
            console.log('markguide ' + require('../package').version);
            break;
        case '--help':
        default:
            console.log(`
Usage: markguide [OPTION]

Options:            
  -b, --build=FILE           build all atlas pages, followed with config '--build=./path/to/config.json'
  -v, --version              print version
  --help                     print this message
            `);
    }
} catch (e) {
    if (e.code === 'ENOENT') {
        console.error('Error: no such file or directory "' + e.path + '"');
    } else {
        console.error('Error: ' + e.message);
    }
    process.exit(1);
}
