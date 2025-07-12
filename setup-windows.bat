@echo off
echo Setting up Windows environment...

echo 1. Checking Node.js installation...
node --version
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo 2. Checking npm installation...
npm --version
if errorlevel 1 (
    echo npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo 3. Removing existing node_modules...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo 4. Installing dependencies...
npm install

echo 5. Verifying installation...
if exist node_modules\.bin\next (
    echo Next.js installed successfully!
    echo Starting development server...
    npm run dev
) else (
    echo Installation failed. Trying with clean cache...
    npm cache clean --force
    npm install
    if exist node_modules\.bin\next (
        echo Next.js installed successfully!
        npm run dev
    ) else (
        echo Installation still failed. Please check your npm configuration.
        pause
    )
)

pause