@echo off
echo ============================================
echo    ZA STAMPU - Instalacija (Windows)
echo ============================================
echo.

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo GREŠKA: Node.js nije instaliran!
    echo Preuzmite Node.js sa: https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Instalacija Node.js paketa...
npm install
if %ERRORLEVEL% NEQ 0 (
    echo GREŠKA pri instalaciji!
    pause
    exit /b 1
)

echo [2/3] Pokretanje aplikacije...
npm start

echo.
pause
