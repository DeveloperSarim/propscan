@echo off
echo ================================================
echo   PropScan - Saudi Real Estate Scraper
echo ================================================
echo.

docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Desktop is not running.
    echo Please start Docker Desktop from the Start Menu, wait 30 seconds, then run this again.
    pause
    exit /b 1
)

echo Building PropScan (first run takes 5-10 minutes)...
echo.
docker compose up --build -d

echo.
echo PropScan is running!
echo.
echo   Open your browser at:  http://localhost:8000
echo.
echo To stop PropScan:
echo   docker compose down
echo.
timeout /t 3 /nobreak >nul
start http://localhost:8000
pause
