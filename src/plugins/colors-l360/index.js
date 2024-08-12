'use strict';

const { fs, path, log, c } = require('../../utils/common-utils.js');
const mustache = require('mustache');
const basePlugin = require('../../models/base-plugin.js');

class colorsPlugin extends basePlugin {
    constructor(config, options) {
        super(config, options);

        if(path.isAbsolute(options.filePath)) {
            this.filePath = options.filePath;
        } else {
            this.filePath = path.join(config.guideSrc, options.filePath);
        }

    }

    init() {
        // Optional initialization logic
    }

    getConfiguration() {
        return {
            id: 'colors',
            title: 'Colors',
            target: '/colors.html',
            type: 'plugin',
            icon: 'paintbrush-16'
        };
    }

    getToc() {
        const toc = [];

        const heading = {
            text: 'test',
            depth: 2,
            escapedText: 'test'
        };

        toc.push(heading);

        return toc;
    }

    getContent() {
        const colors = this.readColorsFromFile(this.filePath);

        return this.generateColorsPage(colors);
    }

    readColorsFromFile(colorsFile) {
        function hexToRgb(hex) {
            let rgb = parseInt(hex.substring(1, 3), 16) + ',';
            rgb += parseInt(hex.substring(3, 5), 16) + ',';
            rgb += parseInt(hex.substring(5, 7), 16);

            return rgb;
        }

        if (fs.existsSync(colorsFile) === false) {
            log(c.red('Error: ') + colorsFile + ' doesn\'t exists!');
            return {};
        }

        const scssData = fs.readFileSync(colorsFile, 'utf8');

        // Break down scss data into lines and skip empty lines
        const lines = scssData.split('\n').filter(line => line.trim() !== '');

        // Array with all scss variables [$color-var => #value]
        let scssVariablesArray = [];

        // Current processed varibale
        let currentVariable = null;

        // Object with color section {name: sectionName, properties: [array {cssVariables}]}
        let colorsCollection = {};
        colorsCollection = {values: []};

        // Color sections array with objects {colorsCollection}
        let colorSections = [];

        let sharedColors = null;
        for (let i = 0; i <= lines.length; ++i) {
            let line = lines[i];
            console.log(line);
            if (typeof line === 'undefined') {
                continue;
            }

            if (line.startsWith('// Shared colors')) {
                sharedColors = true;
            }

            if (sharedColors === null) {
                continue;
            }

            if (line.startsWith('// eob Shared colors')) {
                colorSections.push(colorsCollection);
                break;
            }

            line = line.trim();

            if (line.startsWith('// #')) {
                if (colorsCollection.values.length > 0) {
                    colorSections.push(colorsCollection);
                    colorsCollection = {values: []};
                }

                colorsCollection.name = line.slice(4);
            }

            if (line.startsWith('$')) {
                let [name, hex] = line.split(':').map(part => part.trim());

                if (hex.includes('//')) {
                    hex = hex.split('//')[0].trim();
                }

                if (hex.endsWith(';')) {
                    hex = hex.slice(0, -1);
                }

                let variable = null;
                if (hex.startsWith('$')) {
                    variable = hex;
                    hex = scssVariablesArray[hex];
                }

                if (hex.startsWith('rgb')) {
                    let scssVar1 = hex.match(/(\$(.+?)),/);
                    let scssVar = null;
                    if (scssVar1) {
                        scssVar = scssVariablesArray[scssVar1[1]];
                        hex = hex.replace(scssVar1[0], hexToRgb(scssVar) + ',');
                    }
                }

                scssVariablesArray[name] = hex;
                colorsCollection.values.push({name: name, scssVariable: variable, hex: hex});
            }
        }

        // Debug section
        console.log(JSON.stringify(colorSections, null, 4));
        console.log(scssVariablesArray);

        return {
            colorSections: colorSections
        };
    }

    generateColorsPage(colors) {
        const template = fs.readFileSync(path.join(__dirname, 'templates/template.mustache'), 'utf-8');
        const htmlContent = mustache.render(template, {colors: colors});

        return htmlContent;
    }
}

module.exports = colorsPlugin;
