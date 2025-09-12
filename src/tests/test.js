/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

/*eslint-disable*/

const assert = require('assert');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

// Import modules to be tested
const { allCommands, allCommandCategories } = require('../commands.js');

// Mock chalk for theme.js tests
let originalChalk;
let theme; // Declare theme here

before(() => {
    originalChalk = require('chalk');
    require.cache[require.resolve('chalk')] = {
        exports: {
            hex: (color) => ({
                bold: (text) => `[CHALK_HEX_${color}_BOLD]${text}[/CHALK_HEX_BOLD]`,
            }),
        },
    };
    // Now require theme.js after chalk is mocked
    theme = require('../theme.js');
});

after(() => {
    require.cache[require.resolve('chalk')] = { exports: originalChalk };
});

describe('Basic Test', () => {
    it('should return true', () => {
        assert.strictEqual(true, true);
    });
});

describe('commands.js', () => {
    it('should export allCommands as an array', () => {
        assert.ok(Array.isArray(allCommands));
        assert.ok(allCommands.length > 0);
    });

    it('should export allCommandCategories as an object', () => {
        assert.ok(typeof allCommandCategories === 'object');
        assert.ok(allCommandCategories !== null);
        assert.ok(Object.keys(allCommandCategories).length > 0);
    });

    it('allCommands should contain expected command types', () => {
        assert.ok(allCommands.includes('Get-Process'));
        assert.ok(allCommands.includes('npm install ')); // Note the space for npm commands
        assert.ok(allCommands.includes('ls ')); // Note the space for unix commands
        assert.ok(allCommands.includes('lint'));
    });
});

describe('theme.js', () => {
    it('should export a theme object', () => {
        assert.ok(typeof theme === 'object');
        assert.ok(theme !== null);
    });

    it('should have colors, styles, and text properties', () => {
        assert.ok(typeof theme.colors === 'object');
        assert.ok(typeof theme.styles === 'object');
        assert.ok(typeof theme.text === 'object');
    });

    it('text functions should apply chalk formatting', () => {
        const errorMessage = theme.text.error('Test Error');
        assert.strictEqual(errorMessage, '[CHALK_HEX_#FF0000_BOLD]Test Error[/CHALK_HEX_BOLD]');

        const successMessage = theme.text.success('Test Success');
        assert.strictEqual(successMessage, '[CHALK_HEX_#00FF00_BOLD]Test Success[/CHALK_HEX_BOLD]');
    });
});

describe('powershell-utils.js', () => {
    let originalExecAsync;
    let powershellUtils; // To hold the module after require

    beforeEach(() => {
        // Clear cache for powershell-utils.js to ensure we get a fresh module
        delete require.cache[require.resolve('../powershell-utils.js')];
        powershellUtils = require('../powershell-utils.js');
        originalExecAsync = powershellUtils.execAsync; // Save original

        // Mock execAsync directly
        powershellUtils.execAsync = async (command) => {
            if (command.includes('Write-Output $PROFILE')) {
                return {
                    stdout: '$PROFILE',
                    stderr: '',
                };
            } else if (command.includes('powershell -Command')) {
                const mockOutput = JSON.stringify(['MyFunction', 'myalias', 'anotheralias']);
                return { stdout: mockOutput, stderr: '' };
            } else {
                throw new Error('Unknown command');
            }
        };
    });

    afterEach(() => {
        powershellUtils.execAsync = originalExecAsync; // Restore original
    });

    it('getProfileCommands should return an array of commands from profile', async () => {
        const commands = await powershellUtils.getProfileCommands();
        assert.ok(Array.isArray(commands));
        assert.deepStrictEqual(commands, ['MyFunction', 'myalias', 'anotheralias']);
    });

    it('getProfileCommands should return an empty array on error', async () => {
        // Override execAsync mock for this specific test case
        powershellUtils.execAsync = async (command) => {
            throw new Error('Mocked execAsync error');
        };

        const commands = await powershellUtils.getProfileCommands();
        assert.ok(Array.isArray(commands));
        assert.deepStrictEqual(commands, []);
    });

    it('getProfileCommands should return an empty array if profile is empty or no commands found', async () => {
        // Override execAsync mock for this specific test case
        powershellUtils.execAsync = async (command) => {
            if (command.includes('Write-Output $PROFILE')) {
                return {
                    stdout: '$PROFILE',
                    stderr: '',
                };
            } else if (command.includes('powershell -Command')) {
                return { stdout: '[]', stderr: '' }; // Empty JSON array
            } else {
                throw new Error('Unknown command');
            }
        };

        const commands = await powershellUtils.getProfileCommands();
        assert.ok(Array.isArray(commands));
        assert.deepStrictEqual(commands, []);
    });
});

// Mock fs and path for index.js functions if they were exported
// Since they are not exported, these tests are commented out.
/*
describe('index.js utility functions (if exported)', () => {
    let originalFs;
    let originalPath;

    beforeEach(() => {
        originalFs = { ...fs };
        originalPath = { ...path };

        // Mock fs.readdirSync and fs.statSync
        fs.readdirSync = (dirPath) => {
            if (dirPath.includes('mock_dir')) {
                return ['file1.txt', 'folder1', 'anotherfile.js'];
            }
            return [];
        };
        fs.statSync = (filePath) => {
            if (filePath.includes('folder1')) {
                return { isDirectory: () => true };
            }
            return { isDirectory: () => false };
        };
        fs.existsSync = (filePath) => {
            if (filePath.includes('package.json')) {
                return true;
            }
            return false;
        };
        fs.readFileSync = (filePath, encoding) => {
            if (filePath.includes('package.json')) {
                return JSON.stringify({
                    scripts: {
                        test: 'mocha',
                        start: 'node index.js',
                    },
                });
            }
            return '';
        };

        // Mock path functions
        path.dirname = (p) => originalPath.dirname(p);
        path.basename = (p) => originalPath.basename(p);
        path.join = (...args) => originalPath.join(...args);
        path.resolve = (...args) => originalPath.resolve(...args);
    });

    afterEach(() => {
        // Restore original fs and path
        Object.assign(fs, originalFs);
        Object.assign(path, originalPath);
    });

    // Example test for createProgressBar (if exported)
    // it('createProgressBar should return correct progress bar string', () => {
    //     const progressBar = createProgressBar(50, 10);
    //     assert.strictEqual(progressBar, '[=====     ] 50%');
    // });

    // Example test for getFileAndFolderCompletions (if exported)
    // it('getFileAndFolderCompletions should return correct completions', () => {
    //     const completions = getFileAndFolderCompletions('mock_dir/f');
    //     assert.deepStrictEqual(completions, ['mock_dir/file1.txt']);
    // });

    // Example test for getNpmScriptCompletions (if exported)
    // it('getNpmScriptCompletions should return correct npm script completions', () => {
    //     const completions = getNpmScriptCompletions('npm run t');
    //     assert.deepStrictEqual(completions, ['npm run test']);
    // });
});

*/
