@echo off
setlocal EnableDelayedExpansion
title Living News Map - Setup
color 0B

echo.
echo  ============================================
echo   LIVING NEWS MAP - One-Click Setup
echo   Windows 11 Installer
echo  ============================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Node.js not found. Installing via winget...
    echo.
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    if %ERRORLEVEL% NEQ 0 (
        echo [!] winget install failed. Please install Node.js manually from:
        echo     https://nodejs.org/en/download/
        echo.
        pause
        exit /b 1
    )
    echo [OK] Node.js installed. Please restart this script.
    pause
    exit /b 0
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo [OK] Node.js found: !NODE_VER!
)

:: Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] npm not found. It should come with Node.js.
    echo     Please reinstall Node.js from https://nodejs.org
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
    echo [OK] npm found: !NPM_VER!
)

echo.
echo [*] Setting up frontend...
echo.

cd /d "%~dp0frontend"

echo [*] Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [!] Failed to install frontend dependencies.
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed.

echo.
echo [*] Creating .env file for mock mode...
if not exist .env (
    echo VITE_MOCK_NEWS=true> .env
    echo VITE_WS_URL=ws://localhost:8000/ws>> .env
    echo VITE_API_URL=http://localhost:8000>> .env
)
echo [OK] Environment configured.

echo.
echo  ============================================
echo   Setup Complete!
echo  ============================================
echo.
echo   To start the app, run:
echo     cd frontend
echo     npm run dev
echo.
echo   Or simply double-click "start.bat"
echo.
echo   The app will open at http://localhost:5173
echo   Running in mock mode with simulated news.
echo.
echo   To connect to real data:
echo   1. Open Settings in the app
echo   2. Switch to WebSocket or REST mode
echo   3. Enter your data source URL
echo.

:: Create start.bat shortcut
cd /d "%~dp0"
(
    echo @echo off
    echo cd /d "%%~dp0frontend"
    echo echo Starting Living News Map...
    echo echo Open http://localhost:5173 in your browser
    echo call npm run dev
) > start.bat

echo [OK] Created start.bat for quick launch.
echo.
pause
