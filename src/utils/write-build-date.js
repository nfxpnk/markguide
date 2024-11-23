'use strict';

const { fs, path, log, c } = require('./common-utils.js');

function writeBuildDate(markguideConfig) {
    log('Writing build date file');

    const buildDateOutputPath = path.join(markguideConfig.guideDest, 'build-date.js');

    // Get the current date in ISO format
    const currentDate = new Date();

    // Format the date as Y-m-d H:i
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');

    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;

    fs.writeFileSync(
        buildDateOutputPath,
        `const buildDate = new Date('${formattedDateTime}');\n` +
        `const buildDateString = '${formattedDateTime}';\n`,
        error => {
            if (error) {
                log(error);
            }
        }
    );
}

module.exports = writeBuildDate;
