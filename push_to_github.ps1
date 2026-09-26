# PowerShell Script to Push Student Portal to GitHub
param (
    [string]$Token
)

$git = "C:\Users\DELL\.gemini\antigravity\scratch\mingit\cmd\git.exe"
$repoName = "student-portal-and-registration-system"
$username = "DeepGadhiya116"

if (-not $Token) {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " GitHub Push Helper for $username" -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "GitHub requires a Personal Access Token (PAT) for security." -ForegroundColor White
    Write-Host "Generate one in 30 seconds at: https://github.com/settings/tokens" -ForegroundColor Green
    Write-Host "(Select 'Tokens (classic)' -> Check 'repo' scope)" -ForegroundColor Gray
    Write-Host ""
    $Token = Read-Host "Paste your GitHub Personal Access Token (ghp_...)" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Token)
    $Token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

if (-not $Token) {
    Write-Host "Error: Token cannot be empty." -ForegroundColor Red
    exit 1
}

# 1. Create the repository on GitHub if it doesn't already exist
Write-Host "Step 1: Checking / creating repository on GitHub..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "token $Token";
    "Accept" = "application/vnd.github.v3+json";
    "User-Agent" = "PowerShell-StudentPortal"
}

$repoBody = @{
    name = $repoName;
    description = "Centralized Student Portal and Registration System built with React, Tailwind CSS, Node.js, Express, and MongoDB (Project #2)";
    private = $false
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method POST -Headers $headers -Body $repoBody -ContentType "application/json"
    Write-Host "Repository created successfully at: $($createResponse.html_url)" -ForegroundColor Green
} catch {
    Write-Host "Repository already exists or checked: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 2. Push to GitHub
Write-Host "Step 2: Pushing commits to GitHub..." -ForegroundColor Cyan
$remoteUrl = "https://${username}:${Token}@github.com/${username}/${repoName}.git"
& $git push -u $remoteUrl main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host " SUCCESS! Project published to GitHub: https://github.com/${username}/${repoName}" -ForegroundColor Green
} else {
    Write-Host "Push failed. Please check your token permissions." -ForegroundColor Red
}
