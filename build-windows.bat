@echo off
echo ============================================
echo    ZA STAMPU - Build Windows Installer
echo ============================================
echo.

echo [1/2] Instalacija svih paketa...
npm install

echo [2/2] Kreiranje instalera...
npm run build:win

echo.
echo Installer je u folderu: dist\
echo.
pause
