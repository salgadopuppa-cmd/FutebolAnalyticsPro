# Push and create PR helper
# Save this file in the repo root and run from PowerShell:
#   Set-Location 'C:\Users\unik2\Downloads\FutebolAnalyticsPro'
#   .\push-and-pr.ps1

$branch = 'e2e/ci-integration'
$defaultBase = 'main'

function Run-Command($cmd) {
    Write-Host "`n> $cmd" -ForegroundColor Cyan
    iex $cmd
    if ($LASTEXITCODE -ne 0) { Write-Host "Command failed: $cmd" -ForegroundColor Red; return $false }
    return $true
}

Write-Host "Working directory: $(Get-Location)" -ForegroundColor Green
if (-not (Test-Path .git)) { Write-Host "This directory doesn't look like a git repo. Please cd into your repo root." -ForegroundColor Yellow; exit 1 }

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI 'gh' not found. Attempting to install via winget..." -ForegroundColor Yellow
    try {
        iex "winget install --id GitHub.cli -e"
    } catch {
        Write-Host "winget install failed (or winget not installed). Please install gh from https://github.com/cli/cli/releases and re-run this script." -ForegroundColor Red
        Start-Process "https://github.com/cli/cli/releases/latest"
        exit 1
    }
    Start-Sleep -Seconds 2
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { Write-Host "gh still not available. Close and re-open PowerShell, then re-run." -ForegroundColor Yellow; exit 1 }
}

Write-Host "Starting gh auth login (web). Follow the browser prompts to authenticate." -ForegroundColor Cyan
if (-not (Run-Command "gh auth login --web")) { Write-Host "gh auth login failed. Try 'gh auth login' manually and re-run." -ForegroundColor Red; exit 1 }
Run-Command "gh auth status"

Write-Host "`nChecking out branch '$branch'..." -ForegroundColor Cyan
$localBranches = git branch --list | ForEach-Object { $_.Trim() }
if ($localBranches -contains $branch) { Run-Command "git checkout $branch" } else { Run-Command "git checkout -b $branch" }

$originUrl = $null
try { $originUrl = (git remote get-url origin) 2>$null } catch { $originUrl = $null }
if (-not $originUrl) {
    $repoUrl = Read-Host "No 'origin' remote found. Enter your GitHub repo URL (HTTPS or SSH), e.g. https://github.com/<OWNER>/<REPO>.git"
    if (-not $repoUrl) { Write-Host "No remote provided; aborting." -ForegroundColor Red; exit 1 }
    Run-Command "git remote add origin $repoUrl"
    $originUrl = $repoUrl
}
Write-Host "Using origin: $originUrl" -ForegroundColor Green

Write-Host "`nPushing branch to origin..." -ForegroundColor Cyan
if (-not (Run-Command "git push -u origin $branch")) { Write-Host "Push failed. Check network/auth and try again." -ForegroundColor Red; exit 1 }

$baseBranch = Read-Host "Enter base branch for PR (press Enter for '$defaultBase')"
if (-not $baseBranch) { $baseBranch = $defaultBase }

$prTitle = "E2E/CI: Playwright multi-browser tests + seed endpoints"
if (Test-Path .\pr-body.md) {
    Write-Host "`nCreating PR using pr-body.md..." -ForegroundColor Cyan
    Run-Command "gh pr create --base $baseBranch --head $branch --title `"$prTitle`" --body-file .\pr-body.md"
} else {
    Write-Host "`npr-body.md not found — creating PR with inline body." -ForegroundColor Yellow
    $inlineBody = @"
Adds Playwright E2E tests, server test endpoints, and CI workflow.
See pr-body.md for full details.
"@
    $tmp = New-TemporaryFile
    Set-Content -Path $tmp -Value $inlineBody -Encoding UTF8
    Run-Command "gh pr create --base $baseBranch --head $branch --title `"$prTitle`" --body-file `"$tmp`""
    Remove-Item $tmp -ErrorAction SilentlyContinue
}

Write-Host "`nDone. If a PR was created, gh printed the URL above." -ForegroundColor Green
Write-Host "Paste the PR URL here and I will review." -ForegroundColor Cyan
