
$ErrorActionPreference = "Stop"
try {
    $profileContent = if (Test-Path "C:\Users\lukas\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1") { Get-Content "C:\Users\lukas\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1" -Raw } else { "" }
    $functionMatches = [regex]::Matches($profileContent, '(?m)^s*functions+([a-zA-Z0-9-]+)')
    $aliasMatches = [regex]::Matches($profileContent, '(?m)^s*(?:Set-Alias|New-Alias)s+(?:-Names+)?([a-zA-Z0-9-]+)')
    
    $functions = $functionMatches | ForEach-Object { $_.Groups[1].Value }
    $aliases = $aliasMatches | ForEach-Object { $_.Groups[1].Value }
    
    $allCommands = @($functions) + @($aliases) | Where-Object { $_ }
    if ($allCommands.Count -eq 0) {
        Write-Output "[]"
    } else {
        $allCommands | ConvertTo-Json -Compress
    }
} catch {
    Write-Output "[]"
}