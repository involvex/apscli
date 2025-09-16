/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const { exec } = require('node:child_process');
const { promisify } = require('util');
const fs = require('node:fs/promises'); // Use fs.promises for async file operations

let execAsync = promisify(exec);

async function getGpuUsage() {
    try {
        const { stdout, stderr } = await execAsync(
            'powershell -Command "(Get-Counter "\\GPU Engine(*\\engtype_3D)\\Utilization Percentage").CounterSamples.CookedValue | Measure-Object -Sum | Select-Object -ExpandProperty Sum"'
        );
        if (stderr) {
            return { error: 'GPU counter not available.' };
        }
        const value = parseFloat(stdout.trim());
        return isNaN(value) ? { error: 'GPU monitoring unavailable.' } : value;
    } catch {
        return { error: 'GPU monitoring unavailable.' };
    }
}

async function getProfileCommands() {
    try {
        const { stdout: profilePath } = await execAsync(
            'powershell -Command "Write-Output $PROFILE"'
        );
        const profile = profilePath.trim();
        console.log('DEBUG: Profile Path:', profile); // Debug log

        try {
            await fs.access(profile); // Check if file exists and is accessible
        } catch (accessError) {
            console.log('DEBUG: Profile does not exist or is not accessible:', accessError.message); // Debug log
            return [];
        }

        const profileContent = await fs.readFile(profile, 'utf16le'); // PowerShell default encoding
        console.log('DEBUG: Profile Content:', profileContent); // Debug log

        const functionRegex = /^\s*function\s+([a-zA-Z0-9_-]+)/gm;
        const aliasRegex = /^\s*(?:Set-Alias|New-Alias)\s+-Name\s+([a-zA-Z0-9_-]+)/gm;

        const functions = [...profileContent.matchAll(functionRegex)].map((match) => match[1]);
        const aliases = [...profileContent.matchAll(aliasRegex)].map((match) => match[1]);

        console.log('DEBUG: Functions found:', functions); // Debug log
        console.log('DEBUG: Aliases found:', aliases); // Debug log

        return [...new Set([...functions, ...aliases])];
    } catch {
        console.error('DEBUG: Error in getProfileCommands'); // Debug log
        return [];
    }
}

module.exports = { getProfileCommands, getGpuUsage };
