@echo off
echo ===================================================
echo [BuySmart] Starting Backend Server...
echo ===================================================

cd /d "%~dp0backend"

REM Find system python launcher
set PY_CMD=python
where python >nul 2>nul
if %errorlevel% neq 0 (
    where py >nul 2>nul
    if %errorlevel% equ 0 (
        set PY_CMD=py
    ) else (
        echo [ERROR] Neither 'python' nor 'py' was found on your PATH.
        echo Please install Python 3.10+ from https://www.python.org/
        pause
        exit /b 1
    )
)

echo Using system Python: %PY_CMD%

REM Create virtual environment if missing
if not exist "venv\Scripts\python.exe" (
    echo Creating Python virtual environment in backend\venv...
    %PY_CMD% -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b %errorlevel%
    )
)

REM Always invoke venv python.exe directly via -m so moving the folder never breaks exe launcher stubs
set "VENV_PY=%CD%\venv\Scripts\python.exe"

"%VENV_PY%" -c "import fastapi, pydantic, email_validator, sqlalchemy, psycopg2, langchain_google_genai, sentence_transformers, pytest" >nul 2>nul
if errorlevel 1 (
    echo Upgrading pip...
    "%VENV_PY%" -m pip install --upgrade pip --quiet

    echo Step 1: Installing core backend packages...
    "%VENV_PY%" -m pip install fastapi "uvicorn[standard]" "pydantic[email]" email-validator pydantic-settings "sqlalchemy>=2.0.36" alembic "python-jose[cryptography]" bcrypt python-multipart numpy httpx python-dotenv pytest --quiet

    echo Step 2: Installing AI and Database drivers...
    "%VENV_PY%" -m pip install -r requirements.txt
) else (
    echo Backend dependencies already installed. Skipping pip install.
)

echo.
echo Seeding database with catalog and knowledge documents...
"%VENV_PY%" seed_data.py

echo.
echo ===================================================
echo [BuySmart] Starting FastAPI server on http://127.0.0.1:8000
echo Interactive Docs: http://127.0.0.1:8000/docs
echo ===================================================
echo.

"%VENV_PY%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
