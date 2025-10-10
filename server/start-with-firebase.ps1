# Usage: .\start-with-firebase.ps1 C:\path\to\serviceAccountKey.json
param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceAccountPath
)

if (-not (Test-Path $ServiceAccountPath)) {
    Write-Error "Service account file not found: $ServiceAccountPath"
    exit 1
}

$env:FIREBASE_SERVICE_ACCOUNT_PATH = $ServiceAccountPath
Write-Output "FIREBASE_SERVICE_ACCOUNT_PATH set to $ServiceAccountPath"

cd (Split-Path -Parent $MyInvocation.MyCommand.Path)
npm install
npm start
