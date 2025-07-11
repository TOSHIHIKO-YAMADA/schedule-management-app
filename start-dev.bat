@echo off
REM Windows用開発サーバー起動スクリプト

echo Starting development server...
echo.

REM 環境変数を設定
set HOST=0.0.0.0
set PORT=3001

REM 開発サーバーを起動
npm run dev

REM エラーが発生した場合はポーズ
if errorlevel 1 (
    echo.
    echo Error occurred while starting the development server.
    pause
)