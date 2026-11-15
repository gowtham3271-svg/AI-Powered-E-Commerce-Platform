@echo off
echo ===================================================
echo [BuySmart] Starting Frontend Development Server...
echo ===================================================

cd /d "%~dp0frontend"

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 'npm' was not found on your PATH.
    echo Please install Node.js (version 18+) from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing npm dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install encountered an error.
        pause
        exit /b %errorlevel%
    )
)

echo.
echo ===================================================
echo [BuySmart] Launching Vite React server...
echo App URL: http://localhost:5173
echo ===================================================
echo.

call npm run dev
pause
