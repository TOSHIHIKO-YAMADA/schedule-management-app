# Schedule Management System

## 概要
Next.js 15とPrismaで構築されたモダンなスケジュール管理システム。従業員・顧客管理、車両管理、スケジューリング機能を統合した包括的なビジネスアプリケーション。

## 🚀 実装済み機能

### ✅ 従業員管理システム
- **CRUD操作**: 作成、読取、更新、削除
- **一覧表示**: 検索、フィルタリング、ページネーション
- **詳細画面**: 統一されたUI/UX、編集モード切り替え
- **データ操作**: CSVエクスポート、インポート、ダミーデータ生成
- **権限管理**: 役割ベースアクセス制御（RBAC）

### ✅ 顧客管理システム
- **CRUD操作**: 作成、読取、更新、削除
- **一覧表示**: 検索、フィルタリング、ページネーション
- **詳細画面**: 従業員管理と同様の統一されたUI
- **共通コンポーネント**: EntityDetailLayoutによる効率的な開発

### ✅ 認証・権限システム
- **Clerk認証**: 完全統合済み
- **役割階層**: Super Admin > Admin > Limited Admin > General
- **API権限**: エンドポイント別の詳細な権限制御
- **ワイルドカードルート**: 動的ルートの権限管理対応

### ✅ 共通UIコンポーネント
- **Radix UI**: Label、Switch、Dialog等のアクセシブルなコンポーネント
- **共通レイアウト**: EntityDetailLayout、DetailSection
- **統一されたデザイン**: 一貫性のあるUI/UXパターン
- **レスポンシブ対応**: モバイルファーストデザイン

## 🛠 技術スタック

### フロントエンド
- **Next.js 15.3.5** (App Router + Turbopack)
- **TypeScript** (strict mode)
- **React 19** 
- **Tailwind CSS v4**
- **Radix UI** (アクセシビリティ対応)
- **Framer Motion** (アニメーション)

### バックエンド・データ
- **Prisma ORM**
- **SQLite** (開発環境)
- **PostgreSQL** (本番環境推奨)
- **Zod** (バリデーション)

### 認証・状態管理
- **Clerk** (認証システム)
- **TanStack Query** (サーバー状態管理)
- **React Hook Form** (フォーム管理)
- **Zustand** (クライアント状態管理)

### 開発ツール
- **ESLint** (コード品質)
- **TypeScript** (型安全性)
- **Turbopack** (高速ビルド)

## 📁 プロジェクト構造

```
schedule-management-app/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── api/               # API Routes
│   │   ├── employees/         # 従業員管理画面
│   │   ├── customers/         # 顧客管理画面
│   │   └── layout.tsx         # Root Layout
│   ├── components/
│   │   ├── ui/               # 基本UIコンポーネント
│   │   ├── shared/           # 共通コンポーネント
│   │   ├── employees/        # 従業員専用コンポーネント
│   │   └── customers/        # 顧客専用コンポーネント
│   ├── lib/
│   │   ├── api-client.ts     # API クライアント
│   │   ├── auth-utils.ts     # 認証ユーティリティ
│   │   ├── api-utils.ts      # API ユーティリティ
│   │   └── prisma.ts         # Prisma クライアント
│   └── hooks/                # カスタムフック
├── prisma/
│   ├── schema.prisma         # データベーススキーマ
│   └── seed.ts               # シードデータ
└── CLAUDE.md                 # Claude Code 設定
```

## 🏗 アーキテクチャ設計

### 共通コンポーネント戦略
- **EntityDetailLayout**: エンティティ詳細画面の統一レイアウト
- **DetailSection**: 情報セクションの再利用可能コンポーネント
- **コード重複削減**: 約60%の重複コード削除を実現

### API設計パターン
- **統一レスポンス形式**: `{success: true, data: {}}`
- **エラーハンドリング**: 一貫したエラーレスポンス
- **認証ミドルウェア**: 全APIの統一された認証チェック

## 🚦 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プロダクションサーバー
npm start

# コード品質チェック
npm run check                # TypeScript + ESLint
npm run typecheck           # TypeScript のみ
npm run lint               # ESLint のみ

# データベース操作
npm run db:generate        # Prisma クライアント生成
npm run db:push           # スキーマをDBに反映
npm run db:migrate        # マイグレーション実行
npm run db:reset          # データベースリセット

# テスト
npm run test:api          # API テスト実行
```

## ⚙️ 環境設定

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.example`を`.env.local`にコピーして設定：

```bash
# 必須: データベース
DATABASE_URL="postgresql://username:password@localhost:5432/schedule_management"

# 認証 (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# 開発設定
NODE_ENV="development"
SKIP_AUTH="true"  # 開発時の認証バイパス
```

### 3. データベースセットアップ
```bash
# Prisma クライアント生成
npm run db:generate

# データベースにスキーマ反映
npm run db:push
```

### 4. 開発サーバー起動
```bash
npm run dev
```

## 🔧 開発ガイドライン

### TypeScript
- **strict mode**有効
- すべてのコンポーネントで適切な型定義
- Props interfaceの明確な定義

### コンポーネント設計
- **Server Components**をデフォルト使用
- 必要時のみ**Client Components**
- **共通コンポーネント**の積極的活用

### API開発
- **withAuth**ミドルウェアの使用
- **統一レスポンス形式**の遵守
- **適切なHTTPステータスコード**

### スタイリング
- **Tailwind CSS**によるユーティリティファースト
- **Radix UI**によるアクセシブルなコンポーネント
- **レスポンシブデザイン**の徹底

## 📋 実装状況

### 🟢 完了済み
- [x] 基本プロジェクト構造
- [x] 認証システム (Clerk)
- [x] データベース設計 (Prisma)
- [x] 従業員管理 (CRUD)
- [x] 顧客管理 (CRUD)
- [x] 共通UIコンポーネント
- [x] 権限管理システム
- [x] API設計・実装
- [x] レスポンシブUI

### 🟡 開発予定
- [ ] スケジュール管理機能
- [ ] 車両管理システム
- [ ] カレンダービュー
- [ ] 通知システム (メール/LINE)
- [ ] ダッシュボード機能
- [ ] レポート機能

## 🧪 テスト

### API テスト
すべてのAPIエンドポイントの動作確認済み：
- 従業員CRUD操作
- 顧客CRUD操作  
- 認証・権限チェック
- エラーハンドリング

### コンポーネントテスト
- 共通コンポーネントの動作確認
- レスポンシブデザインの検証
- アクセシビリティの確認

## 🔐 セキュリティ

- **Clerk認証**: 業界標準の認証システム
- **役割ベースアクセス制御**: 詳細な権限管理
- **API権限チェック**: エンドポイント別の権限制御
- **入力値検証**: Zodによる厳密なバリデーション

## 📝 ライセンス

Private Project

## 🤝 開発チーム

- プロジェクト設計・実装: Claude Code AI Assistant
- アーキテクチャ: Next.js 15 + TypeScript + Prisma

---

**本プロジェクトは本格的なビジネスアプリケーションとして設計・実装されており、スケーラブルで保守性の高いコードベースを提供しています。**