
$ErrorActionPreference = "Stop"
try {
    $profileContent = if (Test-Path "C:\Users\lukas\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1") { Get-Content "C:\Users\lukas\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1" -Raw } else { "Profile not found or empty." }
    Write-Output "--- Raw Profile Content Length ---"
    Write-Output $profileContent.Length
    Write-Output "--- Raw Profile Content (First 100 chars) ---"
    Write-Output $profileContent.Substring(0, [System.Math]::Min(100, $profileContent.Length))
    Write-Output "--- Raw Profile Content (Escaped) ---"
    Write-Output ([regex]::Escape($profileContent))

    # Test a simple regex match
    $testString = "function prompt"
    $testMatch = [regex]::Match($profileContent, $testString)
    Write-Output "--- Test Match Result (function prompt) ---"
    Write-Output "Success: $($testMatch.Success)"
    if ($testMatch.Success) {
        Write-Output "Value: $($testMatch.Value)"
    }

    # Test with a hardcoded string to isolate regex functionality
    $hardcodedContent = "function My-TestFunction { Write-Host 'Hello' }"
    $hardcodedMatch = [regex]::Match($hardcodedContent, '(?m)^*function+([a-zA-Z0-9-]+)')
    Write-Output "--- Test Match Result (Hardcoded Function) ---"
    Write-Output "Success: $($hardcodedMatch.Success)"
    if ($hardcodedMatch.Success) {
        Write-Output "Value: $($hardcodedMatch.Groups[1].Value)"
    }

} catch {
    Write-Output "Error in PowerShell script: $($_.Exception.Message)"}