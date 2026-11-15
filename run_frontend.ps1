# ===================================================
# [BuySmart] PowerShell Frontend Runner
# ===================================================

$FrontendDir = Join-Path $PSScriptRoot "frontend"
Set-Location $FrontendDir

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " [BuySmart] Starting React + Vite Frontend..." -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "`nFrontend launching at: http://localhost:5173`n" -ForegroundColor Green

npm run dev
