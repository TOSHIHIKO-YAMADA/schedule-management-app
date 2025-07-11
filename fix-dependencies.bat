@echo off
echo ====================================
echo Dependencies Fix Script
echo ====================================
echo.

echo Step 1: Moving to project directory...
cd /d "C:\Users\tygen\Documents\ClaudeCode\schedule-management-app"
echo Current directory: %CD%
echo.

echo Step 2: Removing existing node_modules and package-lock.json...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
    echo node_modules removed.
) else (
    echo node_modules not found.
)

if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
    echo package-lock.json removed.
) else (
    echo package-lock.json not found.
)
echo.

echo Step 3: Cleaning npm cache...
npm cache clean --force
echo npm cache cleaned.
echo.

echo Step 4: Installing all dependencies...
npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo All dependencies installed successfully.
echo.

echo Step 5: Installing specific missing packages...
npm install framer-motion recharts @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list @fullcalendar/react
if errorlevel 1 (
    echo ERROR: Specific package installation failed!
    pause
    exit /b 1
)
echo Specific packages installed successfully.
echo.

echo Step 6: Verifying installations...
echo Checking framer-motion...
npm list framer-motion
echo.
echo Checking recharts...
npm list recharts
echo.
echo Checking @fullcalendar/react...
npm list @fullcalendar/react
echo.

echo Step 7: Starting development server...
echo ====================================
echo All dependencies fixed successfully!
echo Starting development server...
echo ====================================
echo.
npm run dev

echo.
echo If the server failed to start, press any key to exit.
pause