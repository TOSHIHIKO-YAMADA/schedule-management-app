# Windows PowerShell用開発サーバー起動スクリプト

Write-Host "Starting development server..." -ForegroundColor Green
Write-Host ""

# 環境変数を設定
$env:HOST = "0.0.0.0"
$env:PORT = "3001"

# 開発サーバーを起動
try {
    npm run dev
}
catch {
    Write-Host ""
    Write-Host "Error occurred while starting the development server." -ForegroundColor Red
    Write-Host $_.Exception.Message
    Read-Host "Press Enter to exit"
}