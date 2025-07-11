# Windows環境でのセットアップガイド

このドキュメントでは、Windows環境でschedule-management-appを開発・実行するための手順を説明します。

## 前提条件

以下のソフトウェアがインストールされている必要があります：

1. **Node.js** (v18以上推奨)
   - [公式サイト](https://nodejs.org/)からインストーラーをダウンロード
   - インストール時に「Add to PATH」オプションを有効にする

2. **Git for Windows**
   - [公式サイト](https://git-scm.com/download/win)からインストーラーをダウンロード
   - インストール時の改行コード設定で「Checkout as-is, commit Unix-style line endings」を選択

3. **Visual Studio Code** (推奨エディター)
   - [公式サイト](https://code.visualstudio.com/)からインストーラーをダウンロード

## セットアップ手順

### 1. リポジトリのクローン

コマンドプロンプト、PowerShell、またはGit Bashで以下を実行：

```bash
git clone [リポジトリURL]
cd schedule-management-app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local`ファイルを作成し、必要な環境変数を設定：

```bash
# .env.localファイルをコピー（テンプレートがある場合）
copy .env.example .env.local

# または新規作成
echo. > .env.local
```

エディターで`.env.local`を開き、以下の環境変数を設定：

```env
# Clerk認証
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# データベース
DATABASE_URL=your_database_url

# その他の環境変数
```

### 4. 開発サーバーの起動

以下のいずれかの方法で開発サーバーを起動できます：

#### 方法1: npmコマンドを直接実行

```bash
npm run dev
```

#### 方法2: バッチファイルを使用（ポート3001で起動）

```bash
start-dev.bat
```

#### 方法3: PowerShellスクリプトを使用（ポート3001で起動）

PowerShellで実行ポリシーを確認・変更後：

```powershell
# 実行ポリシーの確認
Get-ExecutionPolicy

# 必要に応じて実行ポリシーを変更（管理者権限が必要）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# スクリプトを実行
.\start-dev.ps1
```

## Windows固有の注意事項

### 改行コード

このプロジェクトでは`.gitattributes`ファイルで改行コードを管理しています：
- ソースコードファイルは自動的にLF（Unix形式）に統一
- Windowsスクリプト（.bat、.ps1）はCRLF（Windows形式）を維持

### パスの扱い

- Node.jsは自動的にパス区切り文字を変換するため、コード内では`/`を使用
- 環境変数やコマンドラインでパスを指定する場合は`\`または`/`どちらでも可

### ファイル監視の制限

Windows環境では、ファイル監視に制限がある場合があります。問題が発生した場合：

1. アンチウイルスソフトの除外リストにプロジェクトフォルダを追加
2. Windows Defenderの除外設定：
   - 設定 → 更新とセキュリティ → Windows セキュリティ → ウイルスと脅威の防止
   - 除外の追加でプロジェクトフォルダを指定

### 長いパス名の問題

Windows 10以降では長いパス名をサポートしていますが、有効化が必要な場合があります：

1. グループポリシーエディター（gpedit.msc）を開く
2. コンピューターの構成 → 管理用テンプレート → システム → ファイルシステム
3. 「Win32の長いパスを有効にする」を有効化

## トラブルシューティング

### npm installでエラーが発生する場合

```bash
# キャッシュをクリア
npm cache clean --force

# node_modulesを削除して再インストール
rmdir /s /q node_modules
del package-lock.json
npm install
```

### 開発サーバーが起動しない場合

1. ポートが使用中でないか確認：
   ```bash
   netstat -ano | findstr :3000
   netstat -ano | findstr :3001
   ```

2. Node.jsのバージョンを確認：
   ```bash
   node --version
   ```

3. 環境変数が正しく設定されているか確認

### Git関連の問題

改行コードの問題が発生した場合：

```bash
# 改行コードの設定を確認
git config --get core.autocrlf

# 推奨設定に変更
git config core.autocrlf input

# すべてのファイルの改行コードを正規化
git add --renormalize .
git commit -m "Normalize line endings"
```

## 開発ツール推奨設定

### Visual Studio Code

推奨拡張機能：
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- Prisma
- TypeScript Vue Plugin (Volar)

設定（.vscode/settings.json）：

```json
{
  "files.eol": "\n",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## サポート

問題が解決しない場合は、以下の情報を含めてイシューを作成してください：

- Windows バージョン（`winver`コマンドで確認）
- Node.js バージョン（`node --version`）
- npm バージョン（`npm --version`）
- エラーメッセージの全文
- 実行したコマンド