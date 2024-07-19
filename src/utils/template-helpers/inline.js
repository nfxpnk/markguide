'use strict';

const fs = require('fs');
const path = require('path');

/*
This function is used as a custom helper function in the Mustache template
engine to allow for the inlining of file contents into templates.

By using the {{#inline}} tag in a Mustache template,
and passing in the path to a file as a parameter,
this function can be called to read the contents of the file
and include them in the rendered output of the template.
*/

module.exports = function(text, render) {
    const resource = path.resolve(process.cwd(), render(text));
    if (fs.existsSync(resource)) {
        return fs.readFileSync(resource, 'utf8');
    } else {
        console.warn('File to inline not found ' + resource);
    }
};
