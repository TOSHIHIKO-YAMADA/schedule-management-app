# Dependencies Fix Script (PowerShell)
Write-Host "====================================" -ForegroundColor Green
Write-Host "Dependencies Fix Script" -ForegroundColor Green  
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

try {
    Write-Host "Step 1: Moving to project directory..." -ForegroundColor Yellow
    Set-Location "C:\Users\tygen\Documents\ClaudeCode\schedule-management-app"
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green
    Write-Host ""

    Write-Host "Step 2: Removing existing node_modules and package-lock.json..." -ForegroundColor Yellow
    if (Test-Path "node_modules") {
        Write-Host "Removing node_modules..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force "node_modules"
        Write-Host "node_modules removed." -ForegroundColor Green
    } else {
        Write-Host "node_modules not found." -ForegroundColor Gray
    }

    if (Test-Path "package-lock.json") {
        Write-Host "Removing package-lock.json..." -ForegroundColor Yellow
        Remove-Item -Force "package-lock.json"
        Write-Host "package-lock.json removed." -ForegroundColor Green
    } else {
        Write-Host "package-lock.json not found." -ForegroundColor Gray
    }
    Write-Host ""

    Write-Host "Step 3: Cleaning npm cache..." -ForegroundColor Yellow
    npm cache clean --force
    Write-Host "npm cache cleaned." -ForegroundColor Green
    Write-Host ""

    Write-Host "Step 4: Installing all dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed!"
    }
    Write-Host "All dependencies installed successfully." -ForegroundColor Green
    Write-Host ""

    Write-Host "Step 5: Installing specific missing packages..." -ForegroundColor Yellow
    npm install framer-motion recharts @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list @fullcalendar/react
    if ($LASTEXITCODE -ne 0) {
        throw "Specific package installation failed!"
    }
    Write-Host "Specific packages installed successfully." -ForegroundColor Green
    Write-Host ""

    Write-Host "Step 6: Verifying installations..." -ForegroundColor Yellow
    Write-Host "Checking framer-motion..." -ForegroundColor Cyan
    npm list framer-motion
    Write-Host ""
    Write-Host "Checking recharts..." -ForegroundColor Cyan
    npm list recharts
    Write-Host ""
    Write-Host "Checking @fullcalendar/react..." -ForegroundColor Cyan
    npm list @fullcalendar/react
    Write-Host ""

    Write-Host "Step 7: Starting development server..." -ForegroundColor Yellow
    Write-Host "====================================" -ForegroundColor Green
    Write-Host "All dependencies fixed successfully!" -ForegroundColor Green
    Write-Host "Starting development server..." -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
    Write-Host ""
    
    npm run dev

} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
}