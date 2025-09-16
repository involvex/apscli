/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const fs = require('fs');
const path = require('path');

/**
 * Creates an ASCII progress bar.
 * @param {number} percent - The percentage to display.
 * @param {number} [width=20] - The width of the progress bar.
 * @returns {string} The progress bar string.
 */
function createProgressBar(percent, width = 20) {
    const filled = Math.round(width * (percent / 100));
    const empty = width - filled;
    return '[' + '='.repeat(filled) + ' '.repeat(empty) + '] ' + percent + '%';
}

/**
 * Gets file and folder completions for a given input.
 * @param {string} input - The input to get completions for.
 * @returns {string[]} An array of completions.
 */
function getFileAndFolderCompletions(input) {
    try {
        const dir = path.dirname(input);
        const base = path.basename(input).trim();
        const fullDir = dir === '.' ? process.cwd() : path.resolve(process.cwd(), dir);

        let readdirResult = [];
        try {
            readdirResult = fs.readdirSync(fullDir);
        } catch (readdirError) {
            return [];
        }

        const files = readdirResult
            .filter((item) => item.toLowerCase().startsWith(base.toLowerCase()) || base === '')
            .map((item) => {
                const fullPath = path.join(dir, item);
                try {
                    const stat = fs.statSync(path.resolve(process.cwd(), fullPath));
                    return stat.isDirectory() ? fullPath + path.sep : fullPath;
                } catch (statError) {
                    return fullPath;
                }
            });
        return files;
    } catch (error) {
        return [];
    }
}

/**
 * Gets npm script completions for a given input.
 * @param {string} input - The input to get completions for.
 * @returns {string[]} An array of completions.
 */
function getNpmScriptCompletions(input) {
    try {
        if (input.trim() === 'npm run' || input.trim().startsWith('npm run ')) {
            const packagePath = path.join(process.cwd(), 'package.json');
            if (fs.existsSync(packagePath)) {
                let packageJson = {};
                try {
                    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                } catch (readError) {
                    return [];
                }
                const scripts = packageJson.scripts || {};

                if (input.trim() === 'npm run') {
                    return Object.keys(scripts).map((script) => `npm run ${script}`);
                }

                const scriptPrefix = input.trim().slice('npm run '.length);
                return Object.keys(scripts)
                    .filter((script) => script.toLowerCase().startsWith(scriptPrefix.toLowerCase()))
                    .map((script) => `npm run ${script}`);
            }
        }
        return [];
    } catch (error) {
        return [];
    }
}

/**
 * Strips ANSI escape codes from a string.
 * @param {string} text - The string to strip ANSI codes from.
 * @returns {string} The string without ANSI codes.
 */
function stripAnsiCodes(text) {
    return text.replace(/\u001b\[[\d;]*m/g, '');
}

module.exports = {
    createProgressBar,
    getFileAndFolderCompletions,
    getNpmScriptCompletions,
    stripAnsiCodes,
};
