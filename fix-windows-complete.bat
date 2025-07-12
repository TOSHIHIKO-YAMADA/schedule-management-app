@echo off
echo Complete Windows setup...

echo.
echo Checking Node.js version...
node --version
npm --version

echo.
echo Removing old files...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist .next rmdir /s /q .next

echo.
echo Clearing npm cache...
npm cache clean --force

echo.
echo Installing all dependencies...
npm install

echo.
echo Verifying Next.js installation...
npx next --version

echo.
echo Starting development server...
npm run dev

pause