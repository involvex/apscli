/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const { exec } = require('node:child_process');
const { promisify } = require('util');
const fs = require('node:fs/promises'); // Use fs.promises for async file operations
const path = require('node:path');

let execAsync = promisify(exec);

async function getGpuUsage() {
    try {
        const { stdout, stderr } = await execAsync(
            'powershell -Command "(Get-Counter \"\\GPU Engine(*\\engtype_3D)\\Utilization Percentage\").CounterSamples.CookedValue | Measure-Object -Sum | Select-Object -ExpandProperty Sum"'
        );
        if (stderr) {
            return { error: 'GPU counter not available.' };
        }
        const value = parseFloat(stdout.trim());
        return isNaN(value) ? 0 : value;
    } catch (error) {
        return { error: 'GPU monitoring unavailable.' };
    }
}

async function getProfileCommands() {
    try {
        const { stdout: profilePathOutput } = await execAsync(
            'powershell -Command "Write-Output $PROFILE"'
        );
        const profilePath = profilePathOutput.trim();

        if (
            !profilePath ||
            !(await fs
                .access(profilePath)
                .then(() => true)
                .catch(() => false))
        ) {
            return [];
        }

        const profileContent = await fs.readFile(profilePath, 'utf8');
        const commandRegex = /function\s+([a-zA-Z0-9_-]+)/g;
        const commands = [];
        let match;
        while ((match = commandRegex.exec(profileContent)) !== null) {
            commands.push(match[1]);
        }
        return commands;
    } catch (error) {
        console.error('Error in getProfileCommands:', error);
        return [];
    }
}

module.exports = { getProfileCommands, getGpuUsage };
