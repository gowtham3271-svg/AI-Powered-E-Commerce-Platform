@echo off
echo ===================================================
echo [BuySmart] Launching Full-Stack Application
echo ===================================================

start "BuySmart Backend (FastAPI)" cmd /k "%~dp0run_backend.bat"
timeout /t 3 /nobreak >nul
start "BuySmart Frontend (React + Vite)" cmd /k "%~dp0run_frontend.bat"

echo.
echo Both servers have been launched in separate terminal windows!
echo - Backend API:  http://127.0.0.1:8000 (Swagger docs at /docs)
echo - Frontend App: http://localhost:5173
echo.
