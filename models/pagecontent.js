'use strict';

const fs = require('fs');
const path = require('path');
const marked = require('marked');
const mustache = require('mustache');
const pug = require('pug');
const LoremIpsum = require('lorem-ipsum').LoremIpsum;
const renderer = new marked.Renderer();

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
});

marked.setOptions({
    renderer: renderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
});

const markdownTemplates = '../views/includes/markdown/';
const getFile = fileURL => fs.readFileSync(path.join(__dirname, fileURL), 'utf8');
const elements = {
    'heading': getFile(markdownTemplates + 'heading.mustache'),
    'example': getFile(markdownTemplates + 'example.mustache'),
    'examplePug': getFile(markdownTemplates + 'examplePug.mustache'),
    'exampleArray': getFile(markdownTemplates + 'exampleArray.mustache'),
    'code': getFile(markdownTemplates + 'code.mustache'),
    'hr': getFile(markdownTemplates + 'hr.mustache'),
    'paragraph': getFile(markdownTemplates + 'paragraph.mustache'),
    'ol': getFile(markdownTemplates + 'ol.mustache'),
    'ul': getFile(markdownTemplates + 'ul.mustache'),
    'table': getFile(markdownTemplates + 'table.mustache')
};

renderer.paragraph = text => mustache.render(elements.paragraph, {text: text});

renderer.list = (body, ordered) => {
    const ol = mustache.render(elements.ol, {body: body});
    const ul = mustache.render(elements.ul, {body: body});

    return ordered ? ol : ul;
};

renderer.table = (header, body) => mustache.render(elements.table, {header: header, body: body});

renderer.hr = () => elements.hr;

/**
 * @typedef {Object} commentContent
 * @property {string} content comment content
 */
/**
 * Get comment text from special type of CSS comment
 * @param {string} filePath
 * @return {commentContent}
 */
function getCommentContent(filePath) {
    const file = fs.readFileSync(filePath, 'utf8');
    const documentationCommentRegexp = /\/\*md(\r\n|\n)(((\r\n|\n)|.)*?)\*\//g;
    const statRegexp = /@no-stat(\r\n|\n)/g;
    const match = documentationCommentRegexp.exec(file);

    if (match !== null) {
        const fullContent = match[2];
        const strippedContent = fullContent.replace(statRegexp, '');

        return {
            content: strippedContent
        };
    } else {
        // console.warn(c.yellow('Warn: ') + 'Atlas: Content for import not found in ' + filePath);

        return {
            content: ''
        };
    }
}

function mdImport(fileURL, options) {
    options = options || {};

    let codeItemCount = 0;
    let content = '';
    let toc = [];

    // We need to keep renderers here because they changes page to page
    renderer.heading = (text, level) => {
        const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        const heading = {
            text: text,
            level: level,
            escapedText: escapedText,
            isSection: level <= 2
        };
        toc.push(heading);
        return mustache.render(elements.heading, heading);
    };

    renderer.code = (code, language) => {
        if (language === undefined) {
            language = 'text';
        }

        const includeRegexp = new RegExp('<!--\\s+Include:([\\s\\S]+?)-->', 'ui');
        if (includeRegexp.test(code) === true) {
            let include = code.match(includeRegexp);
            if (typeof include[1] !== 'undefined') {
                include = include[1].trim();
                include = path.join(path.dirname(fileURL), include);
                if (fs.existsSync(include) !== false) {
                    let fileContent = fs.readFileSync(include, 'utf8');

                    if (path.extname(include) === '.pug') {
                        let pugFn = pug.compile(fileContent, {pretty: true});
                        fileContent = pugFn().trim();
                    }

                    code += '\n\n';
                    code += fileContent;
                    code = code.trim();
                } else {
                    code += '\n\nFile doesn\'t exists';
                }
            }
        }

        let parentStyles = null;
        let exampleArray = [];
        const modifierRegexp = new RegExp('<!--\\s+Classes:([\\s\\S]+?)-->', 'ui');
        if (modifierRegexp.test(code) === true) {
            let modifierCode = code.split(modifierRegexp);
            modifierCode[1] = modifierCode[1].trim();

            let modifiers = modifierCode[1].split('\n');

            let html = modifierCode[2].trim();

            modifiers = modifiers.map(e => {
                e = e.trim();
                e = e.split(' - ');
                let className = e[0];
                e[0] = e[0].replace(/\./g, '');
                e[0] = e[0].replace(/:/g, 'pseudo-class-');
                return {
                    modifier: e[0],
                    class: className,
                    name: e[1],
                    html: html.replace(/\[modifier class\]/gm, e[0])
                };
            });

            for (let i = 0; i < modifiers.length; ++i) {
                exampleArray.push(modifiers[i]);
            }
        }

        const parentStylesRegexp = new RegExp('<!--\\s+Parent Styles:([\\s\\S]+?)-->', 'ui');
        if (parentStylesRegexp.test(code) === true) {
            let matchStyles = code.match(parentStylesRegexp);
            if (typeof matchStyles[1] !== 'undefined') {
                parentStyles = matchStyles[1].trim();
            }
        }

        const exampleMarkup = mustache.render(elements.example, {
            style: parentStyles,
            code: code,
            language: language.replace(/_example/, ''),
            title: options.title + '-code-' + codeItemCount
        });

        const exampleMarkupArray = mustache.render(elements.exampleArray, {
            style: parentStyles,
            code: code,
            codeArray: exampleArray,
            language: language.replace(/_example/, ''),
            title: options.title + '-code-' + codeItemCount
        });

        const regularMarkup = mustache.render(elements.code, {
            code: code,
            language: language,
            class: language
        });

        codeItemCount += 1;

        if (exampleArray.length >= 1) {
            return exampleMarkupArray;
        } else if (language === 'html_example') {
            return exampleMarkup;
        } else if (language === 'pug_example') {
            let pugFn = pug.compile(code, {pretty: true});
            let pugCompiled = pugFn().trim();

            const re = new RegExp('{lorem', 'i');
            while (re.test(pugCompiled)) {
                pugCompiled = pugCompiled.replace('{lorem}', lorem.generateSentences(1));
                pugCompiled = pugCompiled.replace('{loremWord}', lorem.generateWords(1));
            }

            return mustache.render(elements.examplePug, {
                pug: code,
                code: pugCompiled,
                title: options.title + '-code-' + codeItemCount
            });
        } else {
            return regularMarkup;
        }
    };

    if (path.extname(fileURL) === '.md') {
        content = marked.parse(fs.readFileSync(fileURL, 'utf8'));
    } else {
        const comment = getCommentContent(fileURL);
        content = marked.parse(comment.content);
    }

    return {
        content: content,
        toc: toc
    };
}

module.exports = mdImport;
