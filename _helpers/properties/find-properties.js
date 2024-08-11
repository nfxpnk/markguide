const fs = require('fs').promises;
const path = require('path');

const sourceDirectory = '../../scss';
const variableUsages = {};
const variableDefinitions = {};

// Function to read and process each line of a file
async function processFile(filePath, callback) {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    lines.forEach((line, lineNumber) => {
        line = line.trim();
        callback(line, lineNumber, filePath);
    });
}

// Callback to extract variable usages (e.g., var(--variable-name))
function extractVariableUsages(line, lineNumber, filePath) {
    const usageMatch = line.match(/var\(--(.+?)\)/iu);
    if (usageMatch) {
        variableUsages[`--${usageMatch[1]}`] = {
            file: filePath,
            line: line,
            lineNumber: lineNumber,
        };
    }
}

// Callback to extract variable definitions (e.g., --variable-name: value)
function extractVariableDefinitions(line, lineNumber, filePath) {
    const definitionMatch = line.match(/^--(.+?):/iu);
    if (definitionMatch) {
        variableDefinitions[`--${definitionMatch[1]}`] = {
            file: filePath,
            line: line,
            lineNumber: lineNumber,
        };
    }
}

// Recursive function to read directories and process .scss files
async function processDirectoryRecursive(directoryPath, fileProcessor) {
    const directoryContents = await fs.readdir(directoryPath, { withFileTypes: true });

    for (const item of directoryContents) {
        const fullPath = path.join(directoryPath, item.name);
        if (item.isDirectory()) {
            // Recurse into subdirectories
            await processDirectoryRecursive(fullPath, fileProcessor);
        } else if (item.isFile() && fullPath.endsWith('.scss') && !fullPath.includes('variables')) {
            // Process .scss files
            await fileProcessor(fullPath);
        }
    }
}

// Main function to orchestrate the processing
async function main() {
    try {
        // Process .scss files to extract variable usages and definitions
        await processDirectoryRecursive(sourceDirectory, async (filePath) => {
            // First pass: extract variable usages
            await processFile(filePath, extractVariableUsages);

            // Second pass: extract variable definitions
            await processFile(filePath, extractVariableDefinitions);
        });

        // Variables defined but not used
        const definedVariables = Object.keys(variableDefinitions);
        const usedVariables = Object.keys(variableUsages);

        // Log variables defined but not used
        definedVariables.filter(variable => !usedVariables.includes(variable)).forEach((variable) => {
            console.log(`var(${variable})`);
        });

        // Log variables used but not defined
        usedVariables.filter(variable => !definedVariables.includes(variable)).forEach((variable) => {
            console.log(`${variable}: #{$c-};`);
        });
    } catch (err) {
        console.error('Error processing files:', err);
    }
}

// Run the main function
main();
