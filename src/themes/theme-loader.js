/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const fs = require('fs');
const theme = require('./theme.js'); // Load default theme

/**
 * Parses a CSS file and extracts theme colors from the :root block.
 * @param {string} filePath - The path to the CSS theme file.
 * @returns {object} A theme object with colors.
 */
function loadTheme(filePath) {
    try {
        const css = fs.readFileSync(filePath, 'utf8');
        const rootRegex = /:root\s*{([^}]+)}/s;
        const rootMatch = css.match(rootRegex);

        if (!rootMatch) {
            return theme; // Return default theme if no :root block is found
        }

        const variables = rootMatch[1];
        const colorRegex = /--([\w-]+):\s*['"]?([^;'"]+)['"]?;/g;
        let match;
        const colors = {};

        while ((match = colorRegex.exec(variables)) !== null) {
            const key = match[1].replace(/-[a-z]/g, (g) => g[1].toUpperCase());
            colors[key] = match[2];
        }

        // Merge with default theme to ensure all properties are present
        const newTheme = { ...theme };
        newTheme.colors = { ...newTheme.colors, ...colors };
        // Preserve text functions from the original theme
        newTheme.text = theme.text;

        return newTheme;
    } catch (error) {
        // Return default theme in case of an error
        return theme;
    }
}

module.exports = { loadTheme };
