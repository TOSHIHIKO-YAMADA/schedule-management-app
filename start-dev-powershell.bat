@echo off
REM PowerShellスクリプトを実行するバッチファイル

echo Starting development server via PowerShell...
powershell -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1"

REM ウィンドウを開いたままにする
pause