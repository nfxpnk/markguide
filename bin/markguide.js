#!/usr/bin/env node
'use strict';

const fs = require('fs');
const args = process.argv[2];

if (typeof args !== 'string') {
    console.error('Error: No arguments provided.');
    process.exit(1);
}

const parseOption = arg => arg.split(/=/);
const [command, value] = parseOption(args);

async function main() {
    try {
        switch (command) {
            case '--build':
            case '-b':
                if (!value) {
                    console.error('Error: Missing configuration path for --build.');
                    process.exit(1);
                }
                // Assuming `withConfig` returns an object with a `buildAll` method
                const { withConfig } = require('../src/markguide.js');
                await withConfig(value).buildAll();
                break;

            case '--version':
            case '-v':
                const { version } = require('../package.json');
                console.log(`markguide ${version}`);
                break;

            case '--help':
            case '-h':
                const docPath = './doc.txt';
                if (fs.existsSync(docPath)) {
                    const doc = fs.readFileSync(docPath, 'utf8');
                    console.log('\n' + doc);
                } else {
                    console.error('Error: Help documentation not found.');
                    process.exit(1);
                }
                break;

            default:
                console.error('Error: Unknown command.');
                process.exit(1);
        }
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.error(`Error: No such file or directory "${e.path}"`);
        } else {
            console.error(`Error: ${e.message}`);
        }
        process.exit(1);
    }
}

main();
