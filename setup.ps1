#!/usr/bin/env pwsh
# Living News Map - PowerShell Setup Script
# Works on Windows 11 with PowerShell 5.1+

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host "   LIVING NEWS MAP - Setup" -ForegroundColor Cyan
Write-Host "   Windows 11 / Cross-Platform Installer" -ForegroundColor Cyan
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
$nodeExists = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeExists) {
    Write-Host "[!] Node.js not found." -ForegroundColor Yellow

    if ($IsWindows -or $env:OS -eq "Windows_NT") {
        Write-Host "[*] Attempting install via winget..." -ForegroundColor Yellow
        try {
            winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
            Write-Host "[OK] Node.js installed. Please restart this script." -ForegroundColor Green
        } catch {
            Write-Host "[!] Auto-install failed. Please install Node.js from:" -ForegroundColor Red
            Write-Host "    https://nodejs.org/en/download/" -ForegroundColor White
        }
    } else {
        Write-Host "[!] Please install Node.js:" -ForegroundColor Red
        Write-Host "    https://nodejs.org/en/download/" -ForegroundColor White
    }
    Read-Host "Press Enter to exit"
    exit 1
} else {
    $nodeVer = node --version
    Write-Host "[OK] Node.js: $nodeVer" -ForegroundColor Green
}

# Check npm
$npmExists = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmExists) {
    Write-Host "[!] npm not found. Reinstall Node.js." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
} else {
    $npmVer = npm --version
    Write-Host "[OK] npm: $npmVer" -ForegroundColor Green
}

# Install frontend
Write-Host ""
Write-Host "[*] Installing frontend dependencies..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
Push-Location $frontendPath

try {
    npm install
    Write-Host "[OK] Dependencies installed." -ForegroundColor Green
} catch {
    Write-Host "[!] npm install failed: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Create .env if missing
$envFile = Join-Path $frontendPath ".env"
if (-not (Test-Path $envFile)) {
    @"
VITE_MOCK_NEWS=true
VITE_WS_URL=ws://localhost:8000/ws
VITE_API_URL=http://localhost:8000
"@ | Set-Content $envFile
    Write-Host "[OK] Created .env for mock mode." -ForegroundColor Green
}

Pop-Location

# Create quick-start script
$startBat = Join-Path $PSScriptRoot "start.bat"
if (-not (Test-Path $startBat)) {
    @"
@echo off
cd /d "%~dp0frontend"
echo Starting Living News Map...
echo Open http://localhost:5173 in your browser
call npm run dev
"@ | Set-Content $startBat
    Write-Host "[OK] Created start.bat" -ForegroundColor Green
}

Write-Host ""
Write-Host "  ============================================" -ForegroundColor Green
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "  ============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Quick start:" -ForegroundColor White
Write-Host "    Double-click start.bat" -ForegroundColor Cyan
Write-Host "    Or: cd frontend && npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Opens at: http://localhost:5173" -ForegroundColor White
Write-Host "  Mode: Mock data (built-in simulator)" -ForegroundColor White
Write-Host ""
Write-Host "  To connect real data:" -ForegroundColor White
Write-Host "    Open Settings > Data tab in the app" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
