@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM =============================================================================
REM Git連携からローカル同期までの自動実行スクリプト (Windows版)
REM =============================================================================

echo.
echo 🚀 Git連携とローカル同期の自動実行を開始します...
echo.

REM 1. 現在の状態確認
echo 1️⃣ 現在の状態を確認中...
for /f %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo 現在のブランチ: %CURRENT_BRANCH%
echo 作業ディレクトリ: %CD%
echo.

REM 2. 変更があるかチェック
echo 2️⃣ 変更があるかチェック中...
git status --porcelain > temp_status.txt
for /f %%i in ('type temp_status.txt ^| find /c /v ""') do set CHANGES=%%i
del temp_status.txt

if %CHANGES% gtr 0 (
    echo ⚠️ 変更が検出されました。ステージングに追加します...
    git add .
    
    REM コミットメッセージの生成
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do (
        set DATE=%%c年%%a月%%b日
    )
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
        set TIME=%%a:%%b
    )
    
    echo 変更をコミット中...
    git commit -m "auto-sync: 自動同期 - !DATE! !TIME!" -m "" -m "🤖 Generated with [Claude Code](https://claude.ai/code)" -m "" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
    echo ✅ コミット完了
) else (
    echo ℹ️ コミットする変更はありません
)
echo.

REM 3. リモートから最新情報を取得
echo 3️⃣ リモートから最新情報を取得中...
git fetch origin
echo ✅ リモート情報取得完了
echo.

REM 4. ローカルの変更をリモートにプッシュ
echo 4️⃣ ローカルの変更をリモートにプッシュ中...
git push origin %CURRENT_BRANCH%
echo ✅ プッシュ完了
echo.

REM 5. リモートから最新の変更を取得（マージ）
echo 5️⃣ リモートから最新の変更を同期中...
git pull origin %CURRENT_BRANCH%
echo ✅ プル完了
echo.

REM 6. 同期状態の確認
echo 6️⃣ 同期状態を確認中...
echo.
echo === 同期完了後の状態 ===
echo ブランチ: %CURRENT_BRANCH%
for /f "delims=" %%i in ('git log --oneline -1') do echo 最新コミット: %%i

git status | findstr "up to date" >nul && (
    echo リモート同期: ✅ 同期済み
) || (
    echo リモート同期: ⚠️ 同期確認中...
)

git status --porcelain > temp_status2.txt
for /f %%i in ('type temp_status2.txt ^| find /c /v ""') do set CHANGES2=%%i
del temp_status2.txt

if %CHANGES2% equ 0 (
    echo 作業ツリー: ✅ クリーン
) else (
    echo 作業ツリー: ⚠️ 変更あり
)

echo.
echo ✅ 🎉 Git連携とローカル同期が完了しました！
echo.

REM 7. 追加情報の表示
echo === 追加情報 ===
echo 📁 プロジェクトディレクトリ: %CD%
for /f "delims=" %%i in ('git remote get-url origin') do echo 🌐 リモートURL: %%i
echo 📊 最新コミット履歴:
git log --oneline -3
echo.
echo ℹ️ ローカル環境での作業継続準備完了 ✨
echo.

pause