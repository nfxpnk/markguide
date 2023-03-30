# Markguide

Atlas is living style-guide, pattern library, guidelines and documentation static site generator with extensive styles monitoring and Sass components reports. It generates documentation from markdown files and documentation comment in `scss` files.

It is opinionated. Because it is, probably, impossible to cover all cases in CSS/Sass.
It designed primarily as "style-guide driven development" tool with focus on splited files approach and incapsulated components with normative Sass imports structure.

* [Live example](https://nfxpnk.github.io/???/)

## Features

* blazing fast thanks to Mustache and Marked. It primary designed as development platform;
* supports incremental builds, so only changed pages could be updated;
* could be setup with live reload or "hot" reload;
* small list of dependencies (Mustache, Marked, PostCSS);
* all internal templates and styles could be overwritten on project level;
* could be used as simple guide docs generator;
* Hologram compatible (without front matter section);

### Components library

Support `/*md` comment in `scss` files where regular markdown could be placed.

* consists of 3 main types of pages - component, guide and reports and could be expanded to many different types;
* navigation tree copy project tree, to ease of orientation and handling huge components library;
* autogenerated Styleguide page based on project constants;

### Guide

Support regular markdown files in components folders and process it as guideline pages.

* markdown support;
* table of contents and permalinks to sections;
* do/not-do colorized examples.

## Getting started

### Installing

```
npm install markguide
```

### Configuring

#### Minimal configuration

`.markguiderc.json`:

```json
{
    "guideSrc": "path/to/scss/",
    "guideDest": "path/to/guide/",
    "cssSrc": "path/to/css/",
    "partials": {
      "assetshead": "path/to/overloaded/project-head.mustache",
    }
}
```

`project-head.mustache`

```html
<link rel="stylesheet" type="text/css" href="../path/to/your/css/project.css"/>
<link rel="stylesheet" type="text/css" href="../css/additional.css"/>
```

Then in `package.json`

```json
{
  "scripts": {
    "build-atlas": "markguide --build=./path/to/config.json"
  }
}
```

### Writing documentation

In `path/to/scss/style.scss`:

```scss
/*md

# Component name

Component description.

Component example (Add one more backtick to make this example works):

``html_example
<h1>Some</h1>
``

``pug_example
h1 Some
``
*/

.regular-scss-here {
    margin: 0;
}
```

### Building Atlas

```
npm run ???
```

See example guideline page or this repo gulp to get the idea how live reload and incremental builds could be set upped.

### API

```js
const atlas = require('markguide').withConfig('./project/root/path/to/config.json');
// or atlas = require('markguide').withConfig({ rawConfigObject });
atlas.build().then(...); // build all guide files without reports. Returns promise.
atlas.build('/absolute/path/to/changed/file.scss').then(...); // compile only particular file, if it marked as documented in project tree. Returns promise.
atlas.buildAll().then(...); // compile all guide pages and reports. Returns promise.
```

Use `atlas.build()` for incremental development builds, where it is not required to have extensive heavy-weight statistic.

### CLI

```shell
Usage: markguide [OPTION]

Options:            
  -b, --build=FILE           build all atlas pages, followed with config '--build=./path/to/config.json'
  -v, --version              print Atlas-guide version
  --help                     print this message
```

## Configuration

Require explicit configuration in `.withConfig()` method.

Minimal configuration:

```json
{
    "guideSrc": "path/to/yours/scss/",
    "guideDest": "path/to/your/static/folder/for/guide/",
    "cssSrc": "assets/css/"
}
```

You could place it wherever you want and target with:

```js
const atlas = require('markguide').withConfig('./from/project/root/path/to/my/config.json');
```

or with rawConfig object if you call atlas from js:

```js
const atlas = require('markguide').withConfig({
    guideSrc: 'path/to/yours/scss/',
    guideDest: 'path/to/your/static/folder/for/guide/',
    cssSrc: 'assets/css/'
    // etc
});
```

### different configuration for different brands

Suppose you store brand configuration into `package.json`:

```json
{
  "name": "some-project",
  "version": "0.0.1",
  "brands": {
    "one": {
        "guide": {
            "guideSrc": "path/to/yours/scss/",
            "guideDest": "path/to/your/static/folder/for/guide/",
            "cssSrc": "assets/css/"
        }
    },
    "another": {
        "guide": {
            "guideSrc": "another/path/to/yours/scss/",
            "guideDest": "another/path/to/your/static/folder/for/guide/",
            "cssSrc": "another/assets/css/"
        }
    }
  }
}
```

than you could build guide like this:

```js
const pkg = require('package.json');
const atlasGuide = require('markguide');

const buildBrandOne = atlasGuide.withConfig(pkg.brands.one).buildAll().then(...);
const buildBrandAnother = atlasGuide.withConfig(pkg.brands.another).buildAll().then(...);

const buildPageBrandOne = atlasGuide.withConfig(pkg.brands.one).build('/abs/path/to/changed/file.scss').then(...);
const buildPageBrandAnother = atlasGuide.withConfig(pkg.brands.another).build('/abs/path/to/changed/file.scss').then(...);
```

### Templates overwrites

As the next step you, probably, want to add your project CSS and JS to render components examples properly.
To make this happen you need to add `partials` to the config, with paths to the templates in your project space:

```json
{
    "partials": {
      "assetshead": "project-root/path/to/project-head.mustache",
      "assetsfooter": "project-root/path/to/project-footer.mustache"
    }
}
```

...and add links to your project CSS/JS. Ex: `project-head.mustache`:

```html
<link rel="stylesheet" type="text/css" href="../relative/path/from/generated/html/to/css/project.css"/>
<link rel="stylesheet" type="text/css" href="../relative/path/from/generated/html/to/any/css/additional.css"/>
```

`project-footer.mustache`:

```html
<script src="../relative/path/from/generated/html/to/js/bundle.js"></script>
```

Note, that paths should be related to generated HTML, no matter where templates are stored. This is simple include that will be incorporated into resulted html.

All templates and partials in Atlas could be overwritten. Please see this repo views folder to get list of all templates and partials.

### Configuration options

```json
{
    "guideSrc": "project-root/path/to/components/directory/",
    "guideDest": "project-root/path/where/atlas/will/be/placed/",
    "cssSrc": "project-root/path/to/css/",
    "scssAdditionalImportsArray": "",
    "componentPrefixes": ["b-", "l-"],
    "excludedCssFiles": "dev_",
    "excludedSassFiles": "dev_",
    "excludedDirs": "dev_",
    "createDestFolder": false,
    "indexPageSource": "project-root/path/to/file.md",
    "templates": {
        "about": "",
        "bundle": "",
        "component": "",
        "guide": "",
        "insights": "",
        "styleguide": ""
    },
    "includes": {
        "aside": "",
        "assetsfooter": "project-root/path/to/foot.mustache",
        "assetshead": "project-root/path/to/head.mustache",
        "componentstataside": "",
        "componentstatfooter": "",
        "componentstatstructure": "",
        "copyright": "",
        "footer": "",
        "header": "",
        "icons": "",
        "logo": "",
        "navigation": "",
        "toc": ""
    },
    "projectInfo": {
        "name": "some-project-name"
    }
}
```

* !`guideSrc` {string} – path to scss files that documented. It is not mandatory that it should be scss root, it could be any folder, but in this case you need to additionaly provide `scssSrc` for statistic reports.
* !`guideDest` {string} – path to generated files folder.
* !`cssSrc` {string} – path to generated CSS. Used for statistical reports.
* `scssAdditionalImportsArray` {array} – array of additional sass imports, if they used. Needed for statistical reports and styleguide auto generation.
* `componentPrefixes` {array of strings} – ['component', 'container'] prefixes that used for components and containers on project. It used to properly guess component types in component structure info (in footer). Ex: `['c-', 'l-']`, `['atlas-', 'l-']`
* `excludedCssFiles` {regexp} – CSS files that would not be processed in statistical reports.
* `excludedSassFiles` {regexp} – Sass files that would not be processed in statistical reports.
* `excludedDirs` {regexp} – directories that will be excluded from doc sets.
* `createDestFolder` {bool} - create destination directory if it is not exist. Default if `false`.
* `indexPageSource` {string} - path to custom markdown file that will be used in index.html. Otherwise atlas try to find README.md in guide src and in the root of the project.
* `templates`– use this field to use your own templates for guide generation.
* `includes` – use this field to use your own partials and includes.
* `projectInfo`
    * `name` {string} - custom name of the project. Otherwise package name will be used.

## Usage

Atlas like Vim consists of two functions - beeping and corrupting files. But with minor difference.
It generates guide and generates reports. You need to document code to make it "beeping" and provide config to make it generate files.

In this section we need to cover 2 topics - documenting and reports configuration.

### Documenting code

#### Doc comment

Add this comment to the scss file and it file appears as component page.

```scss
/*md

# Component name

 */
```

Inside this comment regular markdown syntax would used, so any valid markdown will work here.

```scss
/*md

# Heading level 1

## Heading level 2

## Heading level 3

Regular paragraph with **bold**, _italic_ and `inline code`.

* list item
* list item
* list item

1. ordered list item
2. ordered list item
3. ordered list item

etc.

 */
```

Note: Please avoid some tricky markdown construction, because `marked` super fast, but with this comes not great smartness.

#### Component example

Atlas extends markdown code block "fences" notation with custom type (just like Hologram) -- `html_example`.
That render component html instead of code-example. This keeps documentation compatible with regular markdown.

To create component example you need to add code-block with `html_example`:

add pug_example

```scss
/*md

``html_example
<h1>Add one more backtick to make this example works</h1>
``

*/
```

#### Regular code blocks

Simple `html`, `scss`, `css` "fences" become regular code-block:

```scss
/*md

``html
<h1>heading 1</h1>
``

``scss
.some { maring: 0; }
``

*/
```

#### Template helpers

To inline some resources like svg icons, inlined styles etc. you could use `inline` helper. Ex:

```html
{{#inline}}project-root/assets/src/images/icons.svg{{/inline}}
```

This helper use path to file from your *project root*. Virtually any file could be inlined.

### Guideline/Documentation page

Simply put regular markdown file to components tree and they automatically become part of the atlas.

### Build guide and reports

#### Incremental builds

Regular development flow could be organized in this way – build all guide pages on start and incrementally rebuild pages on file changes:

```js
const atlas = require('markguide').withConfig({config: 'here'});
atlas.build().then(...); // build all guide files without reports

// watch for changes, get changed file path and build needed page:
atlas.build('/absolute/path/to/changed/file.scss').then(...); // compile only this file if was documented on module import
```

##### Gulp example

See example guideline page or this repo `gulpfile.js` to get the idea how live reload and incremental builds could be set upped.

#### Complete Atlas generation

Due to time efforts reports not generated in regular flow. To generate reports you need to call `npm markguide --build`
or in JS:

```js
const atlas = require('markguide').withConfig({config: 'here'});
atlas.buildAll().then(...); // compile all components, guidelines and reports
```

### Autogenerated styleguide based on project constants

Atlas could automatically generate [styleguide page](#) and warn if this constants not used in [component statistic](#)
if project constants is setup.

#### Setup constants

This set up could be a tricky part, because it required full sass compilation and has some limitations.

First you need to use constants in *simple form*. Ex:

```scss
$color-violet: #594199;
$color-fuchsia: #bc1f8c;

$scale-sm: 0.8rem;
$scale-md: 1rem;

// or alternatively CSS custom properties could be used

:root {
    --font-sans: "Arial", "FreeSans", sans-serif;
    --font-serif: "Times New Roman", "Times", "FreeSerif", "Nimbus Roman No9 L", serif;
}
```

Lists, maps or functions is not supported.

Second. If you use *additional imports array* in sass, please, add it to config first `"scssAdditionalImportsArray": ["path/to/additional/sass/files"]`.

Other steps should be simple:

* add path to constants manifest file
* add prefixes that is used for different types of constants

```json
{
    "guideSrc": "path/to/components/directory/",
    "guideDest": "path/where/atlas/will/be/placed/",
    "cssSrc": "path/to/css/",
    "scssAdditionalImportsArray": ["path/to/additional/sass/files"],
    "projectConstants": {
        "constantsSrc": ["path/to/project-settings.scss", "path/to/other-file.scss"],
        "colorPrefix": "color",
        "fontPrefix": "font",
        "scalePrefix": "scale",
        "spacePrefix": "space",
        "motionPrefix": "motion",
        "depthPrefix": "depth",
        "breakpointPrefix": "break"
    }
}
```

After that styleguide page and components stat hints would be generated beside components regular building cycle.

## Troubleshooting

### We have 2 document comments `/*md` in scss file, but only first is shown in documentation.

This is done intentionally. It all designed for 1 component 1 scss file structure. Otherwise it is very hard to keep compoents readable and supportable.

## Contributing

You are welcome for ideas, help and of course code contributing. Please see CONTRIBUTING for more details.

## License

Published under MIT license.
