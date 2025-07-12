# =============================================================================
# Git連携からローカル同期までの自動実行スクリプト (PowerShell版)
# =============================================================================

param(
    [string]$CommitMessage = "",
    [switch]$Force,
    [switch]$Verbose
)

# エラー時に停止
$ErrorActionPreference = "Stop"

# カラー関数
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Info { param([string]$Message) Write-ColorOutput "ℹ️ [INFO] $Message" "Cyan" }
function Write-Success { param([string]$Message) Write-ColorOutput "✅ [SUCCESS] $Message" "Green" }
function Write-Warning { param([string]$Message) Write-ColorOutput "⚠️ [WARNING] $Message" "Yellow" }
function Write-Error { param([string]$Message) Write-ColorOutput "❌ [ERROR] $Message" "Red" }

# =============================================================================
# メイン処理
# =============================================================================

try {
    Write-ColorOutput "🚀 Git連携とローカル同期の自動実行を開始します..." "Magenta"
    Write-Host ""

    # 1. 現在の状態確認
    Write-Info "1️⃣ 現在の状態を確認中..."
    $currentBranch = git branch --show-current
    $currentDir = Get-Location
    Write-Host "現在のブランチ: $currentBranch"
    Write-Host "作業ディレクトリ: $currentDir"
    Write-Host ""

    # 2. 変更があるかチェック
    Write-Info "2️⃣ 変更があるかチェック中..."
    $gitStatus = git status --porcelain
    
    if ($gitStatus) {
        Write-Warning "変更が検出されました。ステージングに追加します..."
        git add .
        
        # コミットメッセージの生成
        if (-not $CommitMessage) {
            $timestamp = Get-Date -Format "yyyy年MM月dd日 HH:mm:ss"
            $CommitMessage = @"
auto-sync: 自動同期 - $timestamp

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
"@
        }
        
        Write-Info "変更をコミット中..."
        git commit -m $CommitMessage
        Write-Success "コミット完了"
    }
    else {
        Write-Info "コミットする変更はありません"
    }
    Write-Host ""

    # 3. リモートから最新情報を取得
    Write-Info "3️⃣ リモートから最新情報を取得中..."
    git fetch origin
    Write-Success "リモート情報取得完了"
    Write-Host ""

    # 4. ローカルの変更をリモートにプッシュ
    Write-Info "4️⃣ ローカルの変更をリモートにプッシュ中..."
    git push origin $currentBranch
    Write-Success "プッシュ完了"
    Write-Host ""

    # 5. リモートから最新の変更を取得（マージ）
    Write-Info "5️⃣ リモートから最新の変更を同期中..."
    git pull origin $currentBranch
    Write-Success "プル完了"
    Write-Host ""

    # 6. 同期状態の確認
    Write-Info "6️⃣ 同期状態を確認中..."
    Write-Host ""
    Write-ColorOutput "=== 同期完了後の状態 ===" "Yellow"
    
    $latestCommit = git log --oneline -1
    $remoteStatus = git status | Select-String "up to date|up-to-date"
    $workingTreeStatus = git status --porcelain
    
    Write-Host "ブランチ: $currentBranch"
    Write-Host "最新コミット: $latestCommit"
    Write-Host "リモート同期: $(if ($remoteStatus) { '✅ 同期済み' } else { '⚠️ 同期確認中...' })"
    Write-Host "作業ツリー: $(if (-not $workingTreeStatus) { '✅ クリーン' } else { '⚠️ 変更あり' })"

    Write-Success "🎉 Git連携とローカル同期が完了しました！"
    Write-Host ""

    # 7. 追加情報の表示
    Write-ColorOutput "=== 追加情報 ===" "Yellow"
    $remoteUrl = git remote get-url origin
    Write-Host "📁 プロジェクトディレクトリ: $currentDir"
    Write-Host "🌐 リモートURL: $remoteUrl"
    Write-Host "📊 最新コミット履歴:"
    git log --oneline -3
    Write-Host ""
    
    Write-Info "ローカル環境での作業継続準備完了 ✨"

    if ($Verbose) {
        Write-Host ""
        Write-ColorOutput "=== 詳細ステータス ===" "Gray"
        git status
    }
}
catch {
    Write-Error "エラーが発生しました: $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-ColorOutput "スクリプト実行完了。何かキーを押してください..." "Gray"
if (-not $Force) {
    Read-Host
}