# ===================================================
# [BuySmart] Launch Both Backend & Frontend
# ===================================================

$Root = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$Root\run_backend.ps1`""
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$Root\run_frontend.ps1`""

Write-Host "Both BuySmart services have been launched in separate PowerShell windows!" -ForegroundColor Green
Write-Host "- Backend API:  http://127.0.0.1:8000 (Swagger docs at /docs)" -ForegroundColor Cyan
Write-Host "- Frontend App: http://localhost:5173" -ForegroundColor Cyan
