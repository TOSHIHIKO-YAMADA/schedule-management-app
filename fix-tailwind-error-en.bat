@echo off
echo Fixing tailwindcss-animate module error...

echo 1. Removing node_modules and package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo 2. Clearing npm cache...
npm cache clean --force

echo 3. Installing tailwindcss-animate separately...
npm install tailwindcss-animate@1.0.7

echo 4. Reinstalling other dependencies...
npm install

echo 5. Starting development server...
npm run dev

echo Fix completed!
pause