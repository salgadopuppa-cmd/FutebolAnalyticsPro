# Start mock server without Firebase
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path (Join-Path $scriptDir 'server')

if (-not (Test-Path -Path (Join-Path (Get-Location) 'package.json'))) {
	Write-Host "package.json not found in $(Get-Location). Please ensure the server folder contains package.json." -ForegroundColor Yellow
	exit 1
}

Write-Host "Installing server dependencies in $(Get-Location)..." -ForegroundColor Cyan
npm install

Write-Host "Starting server (npm start)..." -ForegroundColor Cyan
npm start
