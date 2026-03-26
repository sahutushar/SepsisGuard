@echo off
title SepsisGuard - Launcher
color 0A

echo ============================================
echo   SepsisGuard - Early Sepsis Risk Monitor
echo ============================================
echo.

echo [1/2] Starting FastAPI Backend on port 8000...
start "SepsisGuard Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Next.js Frontend on port 3000...
start "SepsisGuard Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 5 /nobreak > nul

echo.
echo ============================================
echo   Both servers are starting up!
echo.
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo   Frontend : http://localhost:3000
echo ============================================
echo.

start http://localhost:3000
pause
