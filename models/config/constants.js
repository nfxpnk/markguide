'use strict';

const fs = require('fs');
const path = require('path');
const log = require('fancy-log');
const c = require('ansi-colors');
const projectRoot = process.cwd();

function prepareSCSSConstantsFiles(constantsSrc) {
    const sourcesListRaw = Array.isArray(constantsSrc) ? constantsSrc : [constantsSrc];
    let sourcesList = [];
    let contaminatedSources = '';

    sourcesListRaw.forEach(source => {
        const file = source;
        if (!fs.existsSync(file)) {
            // TODO: Fix this
            console.log('NO FILE' + file);
            throw source;
        }
        sourcesList.push(file);
        const content = fs.readFileSync(file, 'utf8');
        contaminatedSources += content;
    });

    return {
        constantsPaths: sourcesList,
        constantsSourceString: contaminatedSources
    };
}

/**
 * Prepare regexps that much user defined constants. Return array of objects:
 * [{
 *     name: 'color'
 *     regex: '(\$|--)color-' | '.^'
 * }]
 * @param declaredConstants
 * @return {Array}
 */
function prepareConstants(declaredConstants) {
    const constants = [
        'colorPrefix',
        'fontPrefix',
        'scalePrefix',
        'spacePrefix',
        'motionPrefix',
        'depthPrefix',
        'breakpointPrefix'
    ];
    let constantsList = [];

    constants.forEach(constant => {
        const internalConstantName = constant.replace(/Prefix/g, ''); // remove "Prefix" from "colorPrefix" string
        const declaredConstantName = declaredConstants[constant];

        return constantsList.push({
            'name': internalConstantName,
            'regex': declaredConstantName !== undefined ? '(\\$|--)' + declaredConstantName : '.^'
        });
    });

    return constantsList;
}

/**
 * Check and map configured constants to internal configuration.
 * Return full or partial object depending of weather is config has error or not.
 * {
 *     isDefined: boolean,
 *     constantsList: Array of objects with name-regexp | empty object if constants not defined
 *     ?constantsSrc: Array of absolute paths to scss settings file,
 *     ?constantsFile: String of scss file/s
 * }
 * @param config
 * @return {{ isDefined: boolean, constantsList: Array }}
 */
function getDeclaredConstants(config) {
    let settingsFilesData;
    let result = {
        'isDefined': false,
        'constantsList': []
    };

    // Check config and FS
    if (config.projectConstants === undefined) {
        return result;
    }

    if (config.projectConstants.constantsSrc === undefined) {
        if (Object.keys(config.projectConstants).length > 0) {
            log(c.yellow('Warning: ') + 'It seems "projectConstants" is declared, but path to constants file' +
                ' ("constantsSrc") is missed. Constants could not be fetched.');
        }
        return result;
    }

    try {
        settingsFilesData = prepareSCSSConstantsFiles(config.projectConstants.constantsSrc);
    } catch (e) {
        log(c.yellow('Warning: ') + '"projectConstants" is declared, but constants file not found (' + e +
            '). Constants could not be fetched.');
        return result;
    }

    // If all ok return full object

    result.isDefined = true;
    result.constantsSrc = settingsFilesData.constantsPaths;
    result.constantsFile = settingsFilesData.constantsSourceString;
    result.constantsList = prepareConstants(config.projectConstants);

    return result;
}

module.exports = getDeclaredConstants;
