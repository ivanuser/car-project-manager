@echo off
echo Fix Project Creation Issues
echo ============================
echo.

echo Checking Node.js installation...
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js and try again
    pause
    exit /b 1
)

echo Running project creation fix...
echo.
node fix-project-creation.js

echo.
echo Fix completed. Press any key to continue...
pause > nul
