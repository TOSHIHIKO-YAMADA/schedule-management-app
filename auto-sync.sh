#!/bin/bash

# =============================================================================
# Git連携からローカル同期までの自動実行スクリプト
# =============================================================================

set -e  # エラー時に終了

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# メイン処理
# =============================================================================

log_info "🚀 Git連携とローカル同期の自動実行を開始します..."

# 1. 現在の状態確認
log_info "1️⃣ 現在の状態を確認中..."
echo "現在のブランチ: $(git branch --show-current)"
echo "作業ディレクトリ: $(pwd)"

# 2. 変更があるかチェック
log_info "2️⃣ 変更があるかチェック中..."
if [[ -n $(git status --porcelain) ]]; then
    log_warning "変更が検出されました。ステージングに追加します..."
    git add .
    
    # コミットメッセージの生成
    TIMESTAMP=$(date '+%Y年%m月%d日 %H:%M:%S')
    COMMIT_MESSAGE="auto-sync: 自動同期 - $TIMESTAMP

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
    
    log_info "変更をコミット中..."
    git commit -m "$COMMIT_MESSAGE"
    log_success "コミット完了"
else
    log_info "コミットする変更はありません"
fi

# 3. リモートから最新情報を取得
log_info "3️⃣ リモートから最新情報を取得中..."
git fetch origin
log_success "リモート情報取得完了"

# 4. ローカルの変更をリモートにプッシュ
log_info "4️⃣ ローカルの変更をリモートにプッシュ中..."
CURRENT_BRANCH=$(git branch --show-current)
git push origin "$CURRENT_BRANCH"
log_success "プッシュ完了"

# 5. リモートから最新の変更を取得（マージ）
log_info "5️⃣ リモートから最新の変更を同期中..."
git pull origin "$CURRENT_BRANCH"
log_success "プル完了"

# 6. 同期状態の確認
log_info "6️⃣ 同期状態を確認中..."
echo ""
echo "=== 同期完了後の状態 ==="
echo "ブランチ: $CURRENT_BRANCH"
echo "最新コミット: $(git log --oneline -1)"
echo "リモート同期: $(git status | grep 'up to date\|up-to-date' && echo '✅ 同期済み' || echo '⚠️  同期確認中...')"
echo "作業ツリー: $(git status --porcelain | wc -l | xargs echo | sed 's/0/✅ クリーン/;s/[1-9].*/⚠️  変更あり/')"

log_success "🎉 Git連携とローカル同期が完了しました！"

# 7. 追加情報の表示
echo ""
echo "=== 追加情報 ==="
echo "📁 プロジェクトディレクトリ: $(pwd)"
echo "🌐 リモートURL: $(git remote get-url origin)"
echo "📊 最新コミット履歴:"
git log --oneline -3

echo ""
log_info "ローカル環境での作業継続準備完了 ✨"