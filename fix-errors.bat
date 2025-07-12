@echo off
echo ====================================
echo Fixing Module Errors
echo ====================================
echo.

echo Step 1: Moving to project directory...
cd /d "C:\Users\tygen\Documents\ClaudeCode\schedule-management-app"
echo Current directory: %CD%
echo.

echo Step 2: Installing missing tailwindcss-animate...
npm install tailwindcss-animate
if errorlevel 1 (
    echo ERROR: tailwindcss-animate installation failed!
    pause
    exit /b 1
)
echo tailwindcss-animate installed successfully.
echo.

echo Step 3: Installing additional missing packages...
npm install class-variance-authority clsx tailwind-merge
if errorlevel 1 (
    echo ERROR: Additional packages installation failed!
    pause
    exit /b 1
)
echo Additional packages installed successfully.
echo.

echo Step 4: Verifying package installations...
npm list tailwindcss-animate
npm list class-variance-authority
npm list clsx
npm list tailwind-merge
echo.

echo Step 5: Cleaning Next.js cache...
if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next
    echo .next directory removed.
)
echo.

echo Step 6: Starting development server...
echo ====================================
echo All errors should be fixed!
echo Starting development server...
echo ====================================
echo.
npm run dev

echo.
echo If errors persist, press any key to exit.
pause