# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Next.js 15.3.5（Turbopack対応）、TypeScript、モダンなReactパターンで構築されたスケジュール管理アプリケーション。現在は初期セットアップ段階で、コア依存関係はインストール済みだが実装はまだ。

## 技術スタック

- **フレームワーク**: Next.js 15.3.5 (App Router)
- **言語**: TypeScript (strict mode)
- **スタイリング**: Tailwind CSS v4
- **認証**: Clerk
- **データベース**: Prisma ORM
- **状態管理**: Zustand
- **フォーム**: React Hook Form + Zod
- **データフェッチング**: TanStack Query (React Query) + Axios
- **日付処理**: date-fns

## 開発コマンド

```bash
npm run dev        # Turbopackで開発サーバー起動
npm run build      # プロダクションビルド
npm run start      # プロダクションサーバー起動
npm run lint       # ESLint実行
```

## 開発前の必須セットアップ

1. **環境変数**: `.env.local`にClerkとデータベースの認証情報を設定
2. **Prismaスキーマ**: `prisma/schema.prisma`を初期化してデータモデルを定義
3. **データベース**: データベース接続を設定してマイグレーションを実行
4. **Clerk統合**: `app/layout.tsx`で認証を設定

## コードアーキテクチャ

- App Routerパターンを使用（Pages Routerではない）
- TypeScript strict modeが有効 - すべてのコードは適切に型付けすること
- パスエイリアス `@/*` は `./src/*` にマップ
- Next.js 15のserver/client componentsの規約に従う

## 重要な開発ルール

機能実装時の注意事項:

1. **ディレクトリ構造**: Next.js App Routerの規約に従う
   - APIルート: `app/api/`
   - コンポーネント: `src/components/`
   - フック: `src/hooks/`
   - ユーティリティ: `src/lib/`

2. **状態管理**: 
   - グローバル状態: Zustand
   - サーバー状態: React Query
   - フォーム状態: React Hook Form

3. **データフェッチング**:
   - APIコールにはReact Query + Axiosを使用
   - 適切なローディング・エラー状態を実装
   - React Queryのキャッシュのベストプラクティスに従う

4. **フォーム**:
   - React Hook Form + Zodバリデーションを使用
   - すべてのフォームにZodスキーマを定義
   - 適切なエラーハンドリングを実装

5. **認証**:
   - 保護されたルートにはClerkミドルウェアを使用
   - ユーザーデータアクセスにはClerkフックを使用

## 個別コンポーネントのテスト

開発中に個別のコンポーネントをテストする方法:

```bash
# appディレクトリにテストページを作成
# 例: app/test/page.tsx でコンポーネントテスト
npm run dev
# http://localhost:3000/test にアクセス
```

## 共通パターン

- デフォルトでServer Componentsを使用、必要な場合のみClient Components
- すべてのデータ構造に適切なTypeScript型を実装
- 日付操作にはdate-fnsを使用
- スタイリングはTailwind CSS v4の規約に従う