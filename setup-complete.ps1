# 🚀 Quick Setup Script for HeartShare

Write-Host "💕 HeartShare - Complete Setup" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running
Write-Host ""
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoProcess = Get-Process -Name mongod -ErrorAction SilentlyContinue
    if ($mongoProcess) {
        Write-Host "✅ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB not running. Please start MongoDB first." -ForegroundColor Yellow
        Write-Host "   Run: mongod" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Could not check MongoDB status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
Set-Location -Path "server"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

# Install frontend dependencies
Write-Host ""
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location -Path "..\ZoomChat"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

# Go back to root
Set-Location -Path ".."

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure MongoDB is running: mongod" -ForegroundColor Gray
Write-Host "2. (Optional) Seed database: cd server && node seed.js" -ForegroundColor Gray
Write-Host "3. Start backend: cd server && npm run dev" -ForegroundColor Gray
Write-Host "4. Start frontend: cd ZoomChat && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Default admin account:" -ForegroundColor Cyan
Write-Host "  Email: admin@example.com" -ForegroundColor Gray
Write-Host "  Password: Admin@123" -ForegroundColor Gray
Write-Host ""
Write-Host "💕 Happy coding!" -ForegroundColor Magenta
