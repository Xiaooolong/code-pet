# uninstall-hooks.ps1
# Removes Claude Pet hooks from ~/.claude/settings.json

$settingsFile = "$env:USERPROFILE\.claude\settings.json"

if (-not (Test-Path $settingsFile)) {
    Write-Host "No settings.json found. Nothing to uninstall."
    exit 0
}

$settings = Get-Content $settingsFile -Raw | ConvertFrom-Json

if (-not ($settings | Get-Member -Name "hooks" -MemberType NoteProperty)) {
    Write-Host "No hooks configured. Nothing to uninstall."
    exit 0
}

# Remove entries that contain "claude-pet-hook" in the command
$events = @("UserPromptSubmit", "PreToolUse", "PostToolUseFailure", "TaskCompleted", "Stop")
foreach ($event in $events) {
    if ($settings.hooks | Get-Member -Name $event -MemberType NoteProperty) {
        $filtered = @($settings.hooks.$event | Where-Object {
            $dominated = $false
            foreach ($h in $_.hooks) {
                if ($h.command -like "*claude-pet-hook*") { $dominated = $true }
            }
            -not $dominated
        })
        if ($filtered.Count -eq 0) {
            $settings.hooks.PSObject.Properties.Remove($event)
        } else {
            $settings.hooks.$event = $filtered
        }
    }
}

$settings | ConvertTo-Json -Depth 10 | Set-Content $settingsFile -Encoding UTF8

Write-Host "Claude Pet hooks uninstalled."

# Ask about cleanup
$cleanup = Read-Host "Delete ~/.claude-pet/ directory? (y/N)"
if ($cleanup -eq "y") {
    Remove-Item -Recurse -Force "$env:USERPROFILE\.claude-pet" -ErrorAction SilentlyContinue
    Write-Host "Cleaned up."
}
