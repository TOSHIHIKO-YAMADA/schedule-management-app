@echo off
echo Windows環境でのtailwindcss-animateエラー修正スクリプト

echo 1. node_modulesとpackage-lock.jsonを削除...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo 2. npm cacheをクリア...
npm cache clean --force

echo 3. tailwindcss-animateを個別にインストール...
npm install tailwindcss-animate@1.0.7

echo 4. 他の依存関係を再インストール...
npm install

echo 5. 開発サーバーを起動...
npm run dev

echo 修正完了！
pause