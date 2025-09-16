/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const proxyquire = require('proxyquire');

// Import modules to be tested
const { allCommands, allCommandCategories } = require('../commands.js');

// Mock chalk for theme.js tests
let originalChalkModule;
let theme; // Declare theme here

before(() => {
    // Store original chalk module
    originalChalkModule = require.cache[require.resolve('chalk')] ? require('chalk') : null;
    // Delete chalk from cache to ensure a fresh load for the mock
    delete require.cache[require.resolve('chalk')];

    // Set up the mock chalk module
    require.cache[require.resolve('chalk')] = {
        exports: {
            hex: (color) => ({
                bold: (text) => `[CHALK_HEX_${color}_BOLD]${text}[/CHALK_HEX_BOLD]`,
            }),
            // Add other chalk methods if they are used and need mocking
            // e.g., green: (text) => `[CHALK_GREEN]${text}[/CHALK_GREEN]`,
        },
    };

    // Clear cache for theme.js to ensure it uses the mocked chalk
    delete require.cache[require.resolve('../../themes/theme.js')];
    theme = require('../../themes/theme.js');
});

after(() => {
    // Restore original chalk module
    if (originalChalkModule) {
        require.cache[require.resolve('chalk')] = { exports: originalChalkModule };
    } else {
        delete require.cache[require.resolve('chalk')];
    }
    // Clear cache for theme.js again to ensure it reloads with original chalk if needed
    delete require.cache[require.resolve('../../themes/theme.js')];
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
        assert.strictEqual(successMessage, '[CHALK_HEX_#32CD32_BOLD]Test Success[/CHALK_HEX_BOLD]'); // Corrected to success color

        const warningMessage = theme.text.warning('Test Warning');
        assert.strictEqual(warningMessage, '[CHALK_HEX_#00FF00_BOLD]Test Warning[/CHALK_HEX_BOLD]'); // Added warning test
    });
});

const {
    createProgressBar,
    getFileAndFolderCompletions,
    getNpmScriptCompletions,
} = require('../utils/utils.js');

describe('index.js utility functions', () => {
    let originalFs;
    let originalPath;
    let originalProcessCwd;

    beforeEach(() => {
        originalFs = {
            readdirSync: fs.readdirSync,
            statSync: fs.statSync,
            existsSync: fs.existsSync,
            readFileSync: fs.readFileSync,
        };
        originalPath = {
            dirname: path.dirname,
            basename: path.basename,
            join: path.join,
            resolve: path.resolve,
            sep: path.sep,
        };
        originalProcessCwd = process.cwd;

        // Mock process.cwd
        process.cwd = () => 'D:\\repos\\customterminalui';

        // Mock fs functions
        fs.readdirSync = (dirPath) => {
            if (dirPath.includes('mock_dir')) {
                return ['file1.txt', 'folder1', 'anotherfile.js'];
            }
            if (dirPath.includes('D:\\repos\\customterminalui')) {
                return ['package.json', 'src', 'public'];
            }
            return [];
        };
        fs.statSync = (filePath) => {
            if (filePath.includes('folder1')) {
                return { isDirectory: () => true };
            }
            if (filePath.includes('src') || filePath.includes('public')) {
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
        fs.readFileSync = (filePath) => {
            if (filePath.includes('package.json')) {
                return JSON.stringify({
                    scripts: {
                        test: 'mocha',
                        start: 'node index.js',
                        dev: 'nodemon index.js',
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
        path.sep = '\\'; // Ensure consistent path separator for Windows
    });

    afterEach(() => {
        // Restore original fs and path functions
        fs.readdirSync = originalFs.readdirSync;
        fs.statSync = originalFs.statSync;
        fs.existsSync = originalFs.existsSync;
        fs.readFileSync = originalFs.readFileSync;

        path.dirname = originalPath.dirname;
        path.basename = originalPath.basename;
        path.join = originalPath.join;
        path.resolve = originalPath.resolve;
        path.sep = originalPath.sep;

        process.cwd = originalProcessCwd;
    });

    it('createProgressBar should return correct progress bar string', () => {
        assert.strictEqual(createProgressBar(50, 10), '[=====     ] 50%');
        assert.strictEqual(createProgressBar(100, 5), '[=====] 100%');
        assert.strictEqual(createProgressBar(0, 5), '[     ] 0%');
        assert.strictEqual(createProgressBar(75, 8), '[======  ] 75%');
    });

    it('getFileAndFolderCompletions should return correct completions for files and folders', () => {
        const completions = getFileAndFolderCompletions('mock_dir/f');
        assert.deepStrictEqual(completions, ['mock_dir\\file1.txt', 'mock_dir\\folder1\\']);

        const allCompletions = getFileAndFolderCompletions('');
        assert.deepStrictEqual(allCompletions, ['package.json', 'src\\', 'public\\']);
    });

    it('getNpmScriptCompletions should return correct npm script completions', () => {
        const completions = getNpmScriptCompletions('npm run t');
        assert.deepStrictEqual(completions, ['npm run test']);

        const allScripts = getNpmScriptCompletions('npm run');
        assert.deepStrictEqual(allScripts, ['npm run test', 'npm run start', 'npm run dev']);

        const noMatch = getNpmScriptCompletions('npm run xyz');
        assert.deepStrictEqual(noMatch, []);
    });
});

const sinon = require('sinon');
let slashCommands;

describe('slash-commands.js', () => {
    let execAsyncStub;
    let mockOutputLog;
    let originalUtilModule;

    beforeEach(() => {
        // Store original util module
        originalUtilModule = require.cache[require.resolve('util')];

        // Create stub
        execAsyncStub = sinon.stub().returns(Promise.resolve({ stdout: '', stderr: '' }));

        // Mock util module before requiring slash-commands.js
        require.cache[require.resolve('util')] = {
            exports: {
                promisify: sinon.stub().returns(execAsyncStub),
            },
        };

        delete require.cache[require.resolve('../../slash-commands')];
        slashCommands = require('../../slash-commands');

        mockOutputLog = {
            log: () => {
                // In a real scenario, you might want to store logs to assert them
            },
        };
    });

    afterEach(() => {
        // Restore original util module
        if (originalUtilModule) {
            require.cache[require.resolve('util')] = originalUtilModule;
        } else {
            delete require.cache[require.resolve('util')];
        }
        sinon.restore();
    });

    it('/init should call the init command', async () => {
        const commands = new Map();
        const initCommand = { execute: sinon.spy() };
        commands.set('init', initCommand);
        await slashCommands.handleSlashCommand('/init', mockOutputLog, {}, commands);
        assert.ok(initCommand.execute.calledOnce);
    });

    it('/findpack should call the findpack command', async () => {
        const commands = new Map();
        const findpackCommand = { execute: sinon.spy() };
        commands.set('findpack', findpackCommand);
        await slashCommands.handleSlashCommand('/findpack my-package', mockOutputLog, {}, commands);
        assert.ok(findpackCommand.execute.calledOnce);
    });

    it('/list should call the list command', async () => {
        const commands = new Map();
        const listCommand = { execute: sinon.spy() };
        commands.set('list', listCommand);
        await slashCommands.handleSlashCommand('/list', mockOutputLog, {}, commands);
        assert.ok(listCommand.execute.calledOnce);
    });

    it('/create should call the create command', async () => {
        const commands = new Map();
        const createCommand = { execute: sinon.spy() };
        commands.set('create', createCommand);
        await slashCommands.handleSlashCommand('/create license', mockOutputLog, {}, commands);
        assert.ok(createCommand.execute.calledOnce);
    });
});
