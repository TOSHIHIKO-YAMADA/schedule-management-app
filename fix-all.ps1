Write-Host "Fixing all known issues..." -ForegroundColor Green

# 1. Clean everything
Write-Host "1. Cleaning build files and caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next, node_modules, .turbo -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# 2. Fix file encodings
Write-Host "2. Fixing file encodings to UTF-8 without BOM..." -ForegroundColor Yellow
Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts","*.js","*.jsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    [System.IO.File]::WriteAllText($_.FullName, $content, [System.Text.UTF8Encoding]::new($false))
}

# 3. Clear npm cache
Write-Host "3. Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# 4. Reinstall dependencies
Write-Host "4. Installing dependencies..." -ForegroundColor Yellow
npm install

# 5. Build to verify
Write-Host "5. Building project to verify..." -ForegroundColor Yellow
npm run build

# 6. Start dev server
Write-Host "6. Starting development server..." -ForegroundColor Green
npm run dev