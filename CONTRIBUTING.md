# Contributing Guide

## 開発ワークフロー

### ブランチ戦略
- `main`: 本番環境用（安定版）
- `develop`: 開発統合ブランチ
- `feature/*`: 機能開発ブランチ
- `fix/*`: バグ修正ブランチ

### 開発手順

1. **機能開発の開始**
```bash
# 最新のdevelopブランチから開始
git checkout develop
git pull origin develop

# 新しい機能ブランチを作成
git checkout -b feature/new-feature-name
```

2. **開発中のコミット**
```bash
# ステージング
git add .

# コミット（規約に従ったメッセージ）
git commit -m "feat: 新機能の説明"
```

3. **プルリクエスト作成前の確認**
```bash
# TypeScript + ESLintチェック
npm run check

# APIテスト実行
npm run test:api

# ビルドテスト
npm run build
```

## コミットメッセージ規約

### フォーマット
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type一覧
- `feat`: 新機能追加
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: コードフォーマット調整
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド・補助ツール関連

### 例
```bash
git commit -m "feat(employees): 従業員一括削除機能を追加

- 複数選択による一括削除機能実装
- 確認ダイアログとエラーハンドリング
- 権限チェック（admin以上）の実装

Closes #123"
```

## コードスタイル

### TypeScript
- **strict mode**を必ず有効にする
- 全てのpropsとstateに適切な型を定義
- `any`型の使用は避ける

### React コンポーネント
```typescript
// ✅ Good
interface ComponentProps {
  title: string;
  isActive: boolean;
  onSubmit: (data: FormData) => void;
}

export function Component({ title, isActive, onSubmit }: ComponentProps) {
  // ...
}

// ❌ Bad
export function Component(props: any) {
  // ...
}
```

### API設計
```typescript
// ✅ 統一されたレスポンス形式
{
  success: true,
  data: {...},
  message?: string
}

// ✅ エラーレスポンス
{
  success: false,
  error: string,
  details?: any
}
```

## プルリクエスト

### チェックリスト
- [ ] TypeScriptエラーなし（`npm run typecheck`）
- [ ] ESLintエラーなし（`npm run lint`）
- [ ] ビルド成功（`npm run build`）
- [ ] 関連するテストが実行可能
- [ ] READMEやドキュメントの更新（必要に応じて）

### レビューガイドライン
1. **機能性**: 仕様通りに動作するか
2. **保守性**: コードが理解しやすく、修正しやすいか
3. **一貫性**: プロジェクトの規約に従っているか
4. **セキュリティ**: セキュリティ上の問題がないか

## 開発環境設定

### 初回セットアップ
```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.localを適切に編集

# データベースセットアップ
npm run db:generate
npm run db:push

# 開発サーバー起動
npm run dev
```

### よく使うコマンド
```bash
# 開発サーバー（ホットリロード付き）
npm run dev

# TypeScript型チェック
npm run typecheck

# ESLint実行
npm run lint

# 全チェック（TypeScript + ESLint）
npm run check

# データベースリセット
npm run db:reset

# Prismaクライアント再生成
npm run db:generate
```

## トラブルシューティング

### よくある問題

**1. Prismaクライアントエラー**
```bash
# Prismaクライアント再生成
npm run db:generate
```

**2. TypeScriptエラー**
```bash
# 型チェック実行
npm run typecheck

# 特定ファイルの型チェック
npx tsc --noEmit src/path/to/file.ts
```

**3. ビルドエラー**
```bash
# キャッシュクリア
npm run clean
npm run build
```

**4. 認証エラー（開発時）**
```bash
# .env.localに以下を追加
SKIP_AUTH="true"
```

## 質問・サポート

- 技術的な質問: GitHubのIssueを作成
- バグ報告: Issue テンプレートを使用
- 機能要求: Discussionsで議論

## ライセンス

このプロジェクトに貢献することで、あなたの貢献がプロジェクトライセンスの下で利用されることに同意したものとみなされます。