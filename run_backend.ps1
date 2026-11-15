# ===================================================
# [BuySmart] PowerShell Backend Runner
# ===================================================

$BackendDir = Join-Path $PSScriptRoot "backend"
Set-Location $BackendDir

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " [BuySmart] Starting FastAPI Backend..." -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

if (-not (Test-Path "venv\Scripts\python.exe")) {
    Write-Host "Creating Python virtual environment in backend\venv..." -ForegroundColor Yellow
    python -m venv venv
}

# Always call venv python.exe directly via -m so moving the folder never breaks launcher stubs
$VenvPy = Join-Path $BackendDir "venv\Scripts\python.exe"

& $VenvPy -c "import fastapi, pydantic, email_validator, sqlalchemy, psycopg2, langchain_google_genai, sentence_transformers, pytest" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing backend packages..." -ForegroundColor Yellow
    & $VenvPy -m pip install fastapi "uvicorn[standard]" "pydantic[email]" email-validator pydantic-settings "sqlalchemy>=2.0.36" alembic "python-jose[cryptography]" bcrypt python-multipart numpy httpx python-dotenv pytest --quiet
    & $VenvPy -m pip install -r requirements.txt
} else {
    Write-Host "Backend dependencies already installed. Skipping pip install." -ForegroundColor Gray
}

Write-Host "`nSeeding database with catalog and RAG documents..." -ForegroundColor Yellow
& $VenvPy seed_data.py

Write-Host "`nServer running at: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Interactive Swagger Docs: http://127.0.0.1:8000/docs`n" -ForegroundColor Green

& $VenvPy -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
