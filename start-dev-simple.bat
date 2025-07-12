@echo off
cd /d "%~dp0"
set HOST=0.0.0.0
set PORT=3001
npm run dev
pause