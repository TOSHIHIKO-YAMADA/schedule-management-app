@echo off
echo Fixing Windows dependencies...

echo.
echo Removing old node_modules...
if exist node_modules rmdir /s /q node_modules

echo.
echo Clearing npm cache...
npm cache clean --force

echo.
echo Installing dependencies...
npm install

echo.
echo Installing nextjs-toploader...
npm install nextjs-toploader

echo.
echo Starting development server...
npm run dev

pause