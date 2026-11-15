@echo off
setlocal enabledelayedexpansion
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "TARGET=%ROOT%\BuySmart"

echo ===================================================
echo [BuySmart] Consolidating Project Into Single Folder
echo Target: %TARGET%
echo ===================================================
echo.
echo [NOTE] Make sure any running backend/frontend terminals are closed.
echo.

if not exist "%TARGET%" mkdir "%TARGET%"

for %%D in (backend frontend dbms_docs) do (
    if exist "%ROOT%\%%D" (
        echo Moving %%D\ into BuySmart\%%D\ ...
        if not exist "%TARGET%\%%D" (
            move "%ROOT%\%%D" "%TARGET%\%%D" >nul 2>&1
        )
        if exist "%ROOT%\%%D" (
            robocopy "%ROOT%\%%D" "%TARGET%\%%D" /E /MOVE /NFL /NDL /NJH /NJS /NC /NS >nul
            if exist "%ROOT%\%%D" rmdir /s /q "%ROOT%\%%D" >nul 2>&1
        )
    )
)

for %%F in (README.md run_all.bat run_backend.bat run_frontend.bat run_all.ps1 run_backend.ps1 run_frontend.ps1) do (
    if exist "%ROOT%\%%F" (
        echo Moving %%F ...
        move /Y "%ROOT%\%%F" "%TARGET%\" >nul
    )
)

if exist "%ROOT%\.test_probe" del /f /q "%ROOT%\.test_probe" >nul 2>&1

echo.
echo ===================================================
echo [SUCCESS] Everything is now inside: %TARGET%
echo.
echo Inside %TARGET% you will find:
echo   - backend\
echo   - frontend\
echo   - dbms_docs\
echo   - run_all.bat / run_all.ps1
echo   - README.md
echo.
echo You can now delete this temporary move_to_BuySmart.bat file
echo and launch the project from %TARGET%\run_all.bat
echo ===================================================
pause
