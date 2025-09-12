/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

// Common PowerShell commands
const powerShellCommands = [
    'Get-Process',
    'Get-Service',
    'Stop-Process',
    'Start-Process',
    'Get-Content',
    'Set-Content',
    'Get-Item',
    'Set-Item',
    'Get-Location',
    'Set-Location',
    'Clear-Host',
    'Write-Host',
    'Get-ChildItem',
    'Remove-Item',
    'Copy-Item',
    'Move-Item',
    'New-Item',
    'Invoke-Command',
    'Get-Help',
    'Get-Command',
];

// NPM related commands
const npmCommands = [
    'npm install',
    'npm start',
    'npm run',
    'node',
    'npx',
    'npm run build',
    'npm test',
    'npm init',
    'npm publish',
    'npm outdated',
    'npm update',
    'npm uninstall',
    'npm list',
    'npm cache clean',
    'npm run dev',
    'npm find ',
    'npm audit',
    'npm audit fix',
];

// Unix-like commands
const unixCommands = ['ls', 'cd', 'dir', 'mkdir', 'rm', 'cp', 'mv'];

// Development commands
const devCommands = ['lint', 'lint:fix', 'format', 'format:check', 'test', 'build', 'dev'];

// Export all command categories
const allCommandCategories = { powerShellCommands, npmCommands, unixCommands, devCommands };
// Combined commands for easy access
const allCommands = [
    ...powerShellCommands,
    ...npmCommands.map((cmd) => cmd + ' '), // Add space after npm commands for parameters
    ...unixCommands.map((cmd) => cmd + ' '), // Add space after unix commands for parameters
    ...devCommands,
];

module.exports = { allCommands, allCommandCategories };
