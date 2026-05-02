@echo off
title Velvet Whisk Bakery - Launching...
echo ==========================================
echo    VELVET WHISK BAKERY - STARTING UP
echo ==========================================
echo.
echo Launching the development server...
echo Please wait a moment while the magic happens...
echo.
npm run dev
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to start the server. 
    echo Please make sure Node.js is installed and "npm install" has been run.
    pause
)
