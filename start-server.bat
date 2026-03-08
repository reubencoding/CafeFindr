@echo off
echo Starting BREW Cafe Server...
echo.
echo This will open the app at http://localhost:8080
echo.
echo Make sure you have Python installed, or use one of these alternatives:
echo - Install VS Code with Live Server extension
echo - Install Node.js and run: npx http-server -p 8080
echo.

python -m http.server 8080

if errorlevel 1 (
    echo.
    echo ERROR: Python not found. Please install Python or use an alternative server.
    echo.
    echo Alternative options:
    echo 1. Install VS Code + Live Server extension
    echo 2. Install Node.js from nodejs.org, then run: npx http-server -p 8080
    echo 3. Use WAMP/XAMPP if you have it installed
    echo.
    pause
)
