@echo off
chcp 65001 >nul
echo.
echo   ╔══════════════════════════════════════════╗
echo   ║    ZA STAMPU — GitHub Setup Skripta     ║
echo   ╚══════════════════════════════════════════╝
echo.

REM ─── PROVJERA ZAHTJEVA ──────────────────────────────────────
echo [1/5] Provjera zahtjeva...

where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [GRESKA] Git nije instaliran! Preuzmi sa: https://git-scm.com
    pause & exit /b 1
)

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [GRESKA] Node.js nije instaliran! Preuzmi sa: https://nodejs.org
    pause & exit /b 1
)

echo [OK] Git i Node.js pronadjeni.

REM ─── GITHUB PODACI ──────────────────────────────────────────
echo.
echo [2/5] GitHub podaci
echo.
set /p GITHUB_USER="  Tvoj GitHub username: "
set /p REPO_NAME="  Naziv repozitorija (Enter = za-stampu): "
if "%REPO_NAME%"=="" set REPO_NAME=za-stampu

echo.
echo   Repozitorij: https://github.com/%GITHUB_USER%/%REPO_NAME%
echo.
set /p CONFIRM="  Nastaviti? (y/n): "
if /i not "%CONFIRM%"=="y" (echo Otkazano. & pause & exit /b 0)

REM ─── GIT INIT ───────────────────────────────────────────────
echo.
echo [3/5] Inicijalizacija Git repozitorija...

if not exist ".git" (
    git init
    echo [OK] Git repo inicijaliziran.
) else (
    echo [INFO] Git repo vec postoji.
)

git add .
git commit -m "Initial commit: Za Stampu v1.0.0" 2>nul || echo [INFO] Nema novih promjena.
echo [OK] Commit napravljen.

REM ─── REMOTE ─────────────────────────────────────────────────
echo.
echo [4/5] Postavljanje GitHub remote-a...

set REMOTE_URL=https://github.com/%GITHUB_USER%/%REPO_NAME%.git

git remote get-url origin >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    git remote set-url origin %REMOTE_URL%
    echo [OK] Remote origin azuriran.
) else (
    git remote add origin %REMOTE_URL%
    echo [OK] Remote origin dodan.
)

echo   URL: %REMOTE_URL%

REM ─── PUSH ───────────────────────────────────────────────────
echo.
echo [5/5] Push na GitHub
echo.
echo VAZNO: Provjeri da si kreirao/la repozitorij na GitHub-u!
echo   -> Idi na: https://github.com/new
echo   -> Naziv: %REPO_NAME%
echo   -> NE dodavaj README, .gitignore ili LICENSE
echo.
set /p CREATED="  Da li si kreirao/la repozitorij? (y/n): "

if /i "%CREATED%"=="y" (
    git branch -M main
    git push -u origin main

    if %ERRORLEVEL% EQU 0 (
        echo.
        echo   ═══════════════════════════════════════
        echo   USPJESNO PUSH-OVANO NA GITHUB!
        echo   ═══════════════════════════════════════
        echo.
        echo   Repozitorij: https://github.com/%GITHUB_USER%/%REPO_NAME%
        echo   Actions:     https://github.com/%GITHUB_USER%/%REPO_NAME%/actions
        echo   Releases:    https://github.com/%GITHUB_USER%/%REPO_NAME%/releases
        echo.
        echo   Za release tag:
        echo   git tag v1.0.0
        echo   git push origin v1.0.0
    ) else (
        echo   [GRESKA] Push nije uspio. Provjeri pristup repozitoriju.
    )
) else (
    echo.
    echo   Kada kreiras repozitorij, pokreni:
    echo   git push -u origin main
)

echo.
pause
