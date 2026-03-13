# claude-pet-hook.ps1
# Usage: claude-pet-hook.ps1 <state>
# States: thinking, coding, reading, running, error, celebrate, idle
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("thinking","coding","reading","running","error","celebrate","idle")]
    [string]$State
)

$dir = "$env:USERPROFILE\.claude-pet"
if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

$ts = [int][DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$json = "{`"state`":`"$State`",`"timestamp`":$ts}"

$tmpFile = Join-Path $dir "status.json.tmp"
$targetFile = Join-Path $dir "status.json"

[System.IO.File]::WriteAllText($tmpFile, $json, [System.Text.Encoding]::UTF8)
Move-Item -Force $tmpFile $targetFile
