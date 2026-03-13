# install-hooks.ps1
# Registers Claude Pet hooks into ~/.claude/settings.json

$hookScript = (Resolve-Path "$PSScriptRoot\..\hooks\claude-pet-hook.ps1").Path -replace '\\', '\\\\'

$claudeDir = "$env:USERPROFILE\.claude"
$settingsFile = Join-Path $claudeDir "settings.json"

# Load existing settings or start fresh
if (Test-Path $settingsFile) {
    $settings = Get-Content $settingsFile -Raw | ConvertFrom-Json
} else {
    if (-not (Test-Path $claudeDir)) {
        New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null
    }
    $settings = [PSCustomObject]@{}
}

# Ensure hooks object exists
if (-not ($settings | Get-Member -Name "hooks" -MemberType NoteProperty)) {
    $settings | Add-Member -NotePropertyName "hooks" -NotePropertyValue ([PSCustomObject]@{})
}

$cmd = "powershell.exe -ExecutionPolicy Bypass -File `"$hookScript`""

# Define our hook entries
$petHooks = @{
    "UserPromptSubmit" = @(@{
        matcher = ""
        hooks = @(@{ type = "command"; command = "$cmd thinking" })
    })
    "PreToolUse" = @(
        @{ matcher = "Edit|Write"; hooks = @(@{ type = "command"; command = "$cmd coding" }) },
        @{ matcher = "Read|Glob|Grep"; hooks = @(@{ type = "command"; command = "$cmd reading" }) },
        @{ matcher = "Bash"; hooks = @(@{ type = "command"; command = "$cmd running" }) }
    )
    "PostToolUseFailure" = @(@{
        matcher = ""
        hooks = @(@{ type = "command"; command = "$cmd error" })
    })
    "TaskCompleted" = @(@{
        matcher = ""
        hooks = @(@{ type = "command"; command = "$cmd celebrate" })
    })
    "Stop" = @(@{
        matcher = ""
        hooks = @(@{ type = "command"; command = "$cmd idle" })
    })
}

# Merge: append to existing hook arrays, don't overwrite
foreach ($event in $petHooks.Keys) {
    $existing = @()
    if ($settings.hooks | Get-Member -Name $event -MemberType NoteProperty) {
        $existing = @($settings.hooks.$event)
    }
    $merged = $existing + $petHooks[$event]
    if ($settings.hooks | Get-Member -Name $event -MemberType NoteProperty) {
        $settings.hooks.$event = $merged
    } else {
        $settings.hooks | Add-Member -NotePropertyName $event -NotePropertyValue $merged
    }
}

$settings | ConvertTo-Json -Depth 10 | Set-Content $settingsFile -Encoding UTF8

Write-Host "Claude Pet hooks installed successfully!"
Write-Host "Hook script: $hookScript"
Write-Host "Settings file: $settingsFile"
Write-Host ""
Write-Host "Restart Claude Code for hooks to take effect."
