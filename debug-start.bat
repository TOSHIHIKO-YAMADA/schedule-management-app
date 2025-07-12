@echo off
echo === Debug Information ===
echo.
echo Current Directory:
cd
echo.

echo Node.js Version:
node --version
echo.

echo NPM Version:
npm --version
echo.

echo Package.json exists:
if exist package.json (
    echo YES
) else (
    echo NO - package.json not found!
)
echo.

echo Node_modules exists:
if exist node_modules (
    echo YES
) else (
    echo NO - Please run: npm install
)
echo.

echo Available NPM scripts:
npm run
echo.

echo.
echo === Press any key to try starting the dev server ===
pause

npm run dev

echo.
echo === End of execution ===
pause