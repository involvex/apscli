/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const { exec } = require('child_process');
const { promisify } = require('util');
let execAsync = promisify(exec);

async function getProfileCommands() {
    try {
        // First, get the profile path
        const { stdout: profilePath } = await execAsync(
            'powershell -Command "Write-Output $PROFILE"'
        );

        // Then read the profile content and extract function names and aliases
        const command = `
        $ErrorActionPreference = "Stop"
        try {
            $profileContent = if (Test-Path $PROFILE) { Get-Content $PROFILE -Raw } else { "" }
            $functionMatches = [regex]::Matches($profileContent, '(?m)^\\s*function\\s+(\\w+[-\\w]*)')
            $aliasMatches = [regex]::Matches($profileContent, '(?m)^\\s*Set-Alias\\s+(?:-Name\\s+)?(\\w+[-\\w]*)|(?m)^\\s*New-Alias\\s+(?:-Name\\s+)?(\\w+[-\\w]*)')
            
            $functions = $functionMatches.Groups | Where-Object { $_.Name -eq "1" } | Select-Object -ExpandProperty Value
            $aliases = $aliasMatches.Groups | Where-Object { $_.Success -and ($_.Name -eq "1" -or $_.Name -eq "2") } | Select-Object -ExpandProperty Value
            
            $allCommands = @($functions) + @($aliases) | Where-Object { $_ }
            if ($allCommands.Count -eq 0) {
                Write-Output "[]"
            } else {
                $allCommands | ConvertTo-Json -Compress
            }
        } catch {
            Write-Output "[]"
        }`;

        const { stdout } = await execAsync(`powershell -Command "${command.replace(/"/g, '`"')}"`);
        const trimmedOutput = stdout.trim();
        const commands = trimmedOutput ? JSON.parse(trimmedOutput) : [];
        return Array.isArray(commands) ? commands : [];
    } catch (error) {
        console.error('Error reading PowerShell profile:', error);
        return [];
    }
}

module.exports = { getProfileCommands };
