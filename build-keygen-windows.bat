@echo off
echo ============================================
echo    Kompajliranje Key Generator-a
echo ============================================
echo.
cd keygen
g++ keygen.cpp -o keygen.exe -std=c++17
if %ERRORLEVEL% EQU 0 (
    echo [OK] keygen.exe kreiran uspjesno!
) else (
    echo [GREŠKA] Potreban je g++ kompajler (MinGW)
    echo Preuzmite sa: https://www.mingw-w64.org/
)
pause
