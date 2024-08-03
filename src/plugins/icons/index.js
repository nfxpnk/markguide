'use strict';

const { fs, path, log, c } = require('../../utils/common-utils.js');
const mustache = require('mustache');
const basePlugin = require('../../models/base-plugin.js');

class iconsPlugin extends basePlugin {
    constructor(config, options) {
        super(config, options);

        // Path to the folder with icons files
        if(path.isAbsolute(options.iconsFolder)) {
            this.iconsFolder = options.iconsFolder;
        } else {
            this.iconsFolder = path.join(config.projectCompiledFiles, options.iconsFolder, '/');
        }

        this.fileExtension = options.fileExtension;
    }

    init() {
        // Optional initialization logic
    }

    getConfiguration() {
        return {
            id: 'icons',
            title: 'Icons',
            target: '/icons.html',
            type: 'plugin',
            icon: 'hash-16'
        };
    }

    getContent() {
        const svgFiles = this.readSvgFiles();
        const icons = svgFiles.map(file => this.extractSvgDetails(file));
        const template = this.getTemplate();
        const htmlContent = mustache.render(template, { icons });

        return htmlContent;
    }

    removeIscommentTags(svgContent) {
        // Define the regular expression to match <iscomment> tags and their content
        const regex = /<iscomment>[\s\S]*?<\/iscomment>/gi;
        // Use the replace method to remove the matched content
        return svgContent.replace(regex, '');
    }

    readSvgFiles() {
        try {
            return fs.readdirSync(this.iconsFolder).filter(file => file.endsWith('.' + this.fileExtension)).map(file => path.join(this.iconsFolder, file));
        } catch (error) {
            log.error(`Error reading SVG files from ${this.iconsFolder}: ${error.message}`);
            return [];
        }
    }

    extractSvgDetails(filePath) {
        try {
            let svgContent = fs.readFileSync(filePath, 'utf8');
            console.log(svgContent);
            svgContent = this.removeIscommentTags(svgContent);

            const svgMatch = svgContent.match(/<svg[^>]*>/);
            if (!svgMatch) throw new Error('Invalid SVG content');

            const svgTag = svgMatch[0];
            const widthMatch = svgTag.match(/width="(\d+)"/);
            const heightMatch = svgTag.match(/height="(\d+)"/);
            const viewBoxMatch = svgTag.match(/viewBox="(\d+ \d+ \d+ \d+)"/);

            const width = widthMatch ? widthMatch[1] : null;
            const height = heightMatch ? heightMatch[1] : null;
            const viewBox = viewBoxMatch ? viewBoxMatch[1].split(' ') : [null, null, null, null];
            const viewBoxWidth = viewBox[2];
            const viewBoxHeight = viewBox[3];

            return {
                svg: svgContent,
                width,
                height,
                viewBoxWidth,
                viewBoxHeight,
                name: path.basename(filePath),
                filename: path.basename(filePath)
            };
        } catch (error) {
            log.error(`Error extracting details from SVG file ${filePath}: ${error.message}`);
            return null;
        }
    }

    getTemplate() {
        try {
            const templatePath = path.join(__dirname, 'templates/template.mustache');
            return fs.readFileSync(templatePath, 'utf8');
        } catch (error) {
            log.error(`Error reading template file: ${error.message}`);
            return '';
        }
    }
}

module.exports = iconsPlugin;
