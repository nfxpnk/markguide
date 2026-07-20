'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const getMandatoryBaseConfig = require('../src/config/config-mandatory.js');
const makeProjectTree = require('../src/models/project-tree.js');
const renderedPageContent = require('../src/models/page-content.js');
const navigationTree = require('../src/models/navigation-tree.js');

function category(id, title, subPages) {
    return {
        id,
        title,
        type: 'category',
        icon: 'file-directory-fill-16',
        iconActive: 'file-directory-open-fill-16',
        subPages,
        depth: []
    };
}

function page(id, title) {
    return {
        id,
        title,
        type: 'component',
        src: '/source/' + title,
        target: '/target/' + id + '.html',
        template: 'component.mustache',
        noDocumentation: false,
        subPages: [],
        depth: []
    };
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function collectCategoryIds(nodes, ids) {
    nodes.forEach(node => {
        if (node.type === 'category') {
            ids.push(node.id);
        }

        collectCategoryIds(node.subPages, ids);
    });

    return ids;
}

function createFixture() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'markguide-nav-'));
    const guideSrc = path.join(root, 'src');
    const guideDest = path.join(root, 'dest');
    const staticFiles = path.join(root, 'static');
    const templates = path.join(root, 'templates');

    [guideSrc, guideDest, staticFiles, templates].forEach(dir => fs.mkdirSync(dir, { recursive: true }));
    ['images', 'styles', 'scripts', 'fonts'].forEach(dir => fs.mkdirSync(path.join(staticFiles, dir), { recursive: true }));

    const componentTemplate = path.join(templates, 'component.mustache');
    const docsTemplate = path.join(templates, 'docs.mustache');

    fs.writeFileSync(componentTemplate, '{{title}}');
    fs.writeFileSync(docsTemplate, '{{title}}');

    return {
        root,
        guideSrc,
        guideDest: guideDest + path.sep,
        staticFiles,
        templates: {
            component: componentTemplate,
            docs: docsTemplate
        }
    };
}

function writeFile(root, relativePath, content) {
    const target = path.join(root, relativePath);

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);

    return target;
}

function makeConfig(fixture, overrides) {
    return Object.assign({
        guideSrc: fixture.guideSrc,
        guideDest: fixture.guideDest,
        excludedSassFiles: /.^/,
        excludedDirs: /.^/,
        templates: fixture.templates,
        navigationTreeMode: 'expanded'
    }, overrides || {});
}

test('default and explicit expanded mode preserve the fully expanded tree', () => {
    const nodes = [
        category('section-app', 'app', [category('section-design', 'design', [page('buttons', '_buttons.scss')])]),
        category('section-empty', 'empty', [])
    ];
    const expected = clone(nodes);

    assert.deepEqual(navigationTree.normalizeNavigationTree(clone(nodes), undefined), expected);
    assert.deepEqual(navigationTree.normalizeNavigationTree(clone(nodes), 'expanded'), expected);
});

test('compact mode collapses a long single-child chain with slash labels', () => {
    const nodes = [
        category('section-app', 'app', [
            category('section-app-design', 'design', [
                category('section-app-design-frontend', 'frontend', [
                    category('section-app-design-frontend-theme', 'Theme', [
                        category('section-app-design-frontend-theme-source', 'source', [
                            page('buttons', '_buttons.scss'),
                            page('forms', '_forms.scss')
                        ])
                    ])
                ])
            ])
        ])
    ];

    navigationTree.normalizeNavigationTree(nodes, 'compact');

    assert.equal(nodes[0].title, 'app/design/frontend/Theme/source');
    assert.deepEqual(nodes[0].subPages.map(node => node.title), ['_buttons.scss', '_forms.scss']);
    assert.equal(nodes[0].subPages[0].depth.length, 1);
});

test('compact mode keeps branching directories and compacts chains under each branch independently', () => {
    const nodes = [
        category('section-source', 'source', [
            category('section-source-components', 'components', [
                category('section-source-components-buttons', 'buttons', [page('buttons', '_buttons.scss')])
            ]),
            category('section-source-layout', 'layout', [
                category('section-source-layout-header', 'header', [page('header', '_header.scss')])
            ])
        ])
    ];

    navigationTree.normalizeNavigationTree(nodes, 'compact');

    assert.equal(nodes[0].title, 'source');
    assert.deepEqual(nodes[0].subPages.map(node => node.title), ['components/buttons', 'layout/header']);
});

test('compact mode does not merge a directory that has both a direct page and a category child', () => {
    const nodes = [
        category('section-source', 'source', [
            page('readme', 'README.md'),
            category('section-source-components', 'components', [
                category('section-source-components-buttons', 'buttons', [page('buttons', '_buttons.scss')])
            ])
        ])
    ];

    navigationTree.normalizeNavigationTree(nodes, 'compact');

    assert.equal(nodes[0].title, 'source');
    assert.deepEqual(nodes[0].subPages.map(node => node.title), ['README.md', 'components/buttons']);
});

test('empty categories are removed', () => {
    const nodes = [category('section-empty', 'empty', []), category('section-full', 'full', [page('buttons', '_buttons.scss')])];

    navigationTree.normalizeNavigationTree(nodes, 'compact');

    assert.deepEqual(nodes.map(node => node.title), ['full']);
});

test('project tree respects exclusions, preserves pages, and keeps coverage counts unchanged across modes', () => {
    const fixture = createFixture();
    const buttonPath = writeFile(
        fixture.guideSrc,
        'app/design/frontend/ImaginationMedia/base/web/css/source/_buttons.scss',
        '/*md\n# Buttons\n*/\n.button {}\n'
    );
    const markdownPath = writeFile(fixture.guideSrc, 'docs/guide.md', '# Guide\n');

    writeFile(fixture.guideSrc, 'app/design/frontend/ImaginationMedia/base/web/css/source/_undocumented.scss', '.undocumented {}');
    writeFile(fixture.guideSrc, 'app/design/frontend/ImaginationMedia/base/web/css/source/excluded/_hidden.scss',
        '/*md\n# Hidden\n*/\n');
    writeFile(fixture.guideSrc, 'empty/ignored.txt', 'ignored');

    const expanded = makeProjectTree(makeConfig(fixture, { navigationTreeMode: 'expanded', excludedDirs: /^excluded$/ }));
    const compact = makeProjectTree(makeConfig(fixture, { navigationTreeMode: 'compact', excludedDirs: /^excluded$/ }));

    assert.deepEqual(expanded.coverage, compact.coverage);
    assert.deepEqual(expanded.coverage, { all: 2, covered: 1, notcovered: 1 });
    assert.equal(expanded.subPages[0].title, 'app');
    assert.equal(expanded.subPages[0].subPages[0].title, 'design');
    assert.equal(compact.subPages[0].title, 'app/design/frontend/ImaginationMedia/base/web/css/source');

    const expandedButton = expanded.subPages[0].subPages[0].subPages[0].subPages[0].subPages[0].subPages[0].subPages[0]
        .subPages[0].subPages[0];
    const compactButton = compact.subPages[0].subPages[0];
    const compactMarkdown = compact.subPages[1].subPages[0];

    assert.equal(compactButton.title, '_buttons.scss');
    assert.equal(compactButton.src, buttonPath);
    assert.equal(compactMarkdown.title, 'guide.md');
    assert.equal(compactMarkdown.src, markdownPath);
    assert.deepEqual(
        {
            id: compactButton.id,
            src: compactButton.src,
            target: compactButton.target,
            template: compactButton.template,
            noDocumentation: compactButton.noDocumentation
        },
        {
            id: expandedButton.id,
            src: expandedButton.src,
            target: expandedButton.target,
            template: expandedButton.template,
            noDocumentation: expandedButton.noDocumentation
        }
    );
    assert.deepEqual(
        renderedPageContent(compactButton.src, { title: compactButton.title }),
        renderedPageContent(expandedButton.src, { title: expandedButton.title })
    );
    assert.equal(JSON.stringify(compact).includes('excluded'), false);
});

test('compact category ids are path-based enough to avoid duplicate basenames in different branches', () => {
    const fixture = createFixture();

    writeFile(fixture.guideSrc, 'alpha/shared/_alpha.scss', '/*md\n# Alpha\n*/\n');
    writeFile(fixture.guideSrc, 'beta/shared/_beta.scss', '/*md\n# Beta\n*/\n');

    const tree = makeProjectTree(makeConfig(fixture, { navigationTreeMode: 'compact' }));
    const ids = collectCategoryIds(tree.subPages, []);

    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(tree.subPages.map(node => node.title), ['alpha/shared', 'beta/shared']);
});

test('invalid navigationTreeMode warns and falls back to expanded', () => {
    const fixture = createFixture();
    const config = getMandatoryBaseConfig({
        guideSrc: fixture.guideSrc,
        guideDest: fixture.guideDest,
        cssSrc: fixture.staticFiles,
        projectStaticFiles: fixture.staticFiles,
        projectImagesFolder: 'images',
        projectStylesFolder: 'styles',
        projectScriptsFolder: 'scripts',
        projectFontsFolder: 'fonts',
        internalAssetsPath: fixture.staticFiles,
        customPluginsPath: fixture.root,
        navigationTreeMode: 'tiny'
    });

    assert.equal(config.navigationTreeMode, 'expanded');
});

test('code block includes resolve relative to source file and configured project root', () => {
    const fixture = createFixture();
    const projectRoot = path.join(fixture.root, 'project');

    fs.mkdirSync(path.join(projectRoot, 'app/code/Vendor/Module'), { recursive: true });
    fs.mkdirSync(path.join(fixture.guideSrc, 'docs/folder-include'), { recursive: true });

    writeFile(fixture.guideSrc, 'docs/file.html', '<button>Local</button>\n');
    writeFile(projectRoot, 'app/code/Vendor/Module/file.less', '.project-file {\n    color: red;\n}\n');

    const scssPath = writeFile(fixture.guideSrc, 'docs/inline.scss', [
        '/*md',
        '```html',
        '<!--',
        'Include: file.html',
        '-->',
        '```',
        '*/'
    ].join('\n'));

    const markdownPath = writeFile(fixture.guideSrc, 'docs/includes.md', [
        '```html',
        '<!--',
        'Include: file.html',
        '-->',
        '```',
        '',
        '```less',
        '<!--',
        'IncludeFromProject: app/code/Vendor/Module/file.less',
        '-->',
        '```'
    ].join('\n'));

    const directoryPath = writeFile(fixture.guideSrc, 'docs/directory-include.md', [
        '```html',
        '<!--',
        'Include: folder-include',
        '-->',
        '```'
    ].join('\n'));

    const page = renderedPageContent(markdownPath, {
        title: 'includes.md',
        projectRoot
    });
    const html = page.sections.map(section => section.content).join('\n');
    const scssPage = renderedPageContent(scssPath, { title: 'inline.scss' });
    const scssHtml = scssPage.sections.map(section => section.content).join('\n');
    const directoryPage = renderedPageContent(directoryPath, { title: 'directory-include.md' });
    const directoryHtml = directoryPage.sections.map(section => section.content).join('\n');

    assert.match(html, /&lt;button&gt;Local/);
    assert.doesNotMatch(html, /Include: file\.html/);
    assert.match(html, /\.project-file/);
    assert.doesNotMatch(html, /IncludeFromProject/);
    assert.match(scssHtml, /&lt;button&gt;Local/);
    assert.doesNotMatch(scssHtml, /Include: file\.html/);
    assert.match(directoryHtml, /File doesn/);
});