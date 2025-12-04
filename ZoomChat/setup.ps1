# HeartShare Setup Script
# Run this after cloning the repository

Write-Host "🎉 HeartShare Video Chat - Setup Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Node.js version
Write-Host "📦 Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "   Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Check npm
Write-Host "`n📦 Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green

# Install dependencies
Write-Host "`n📥 Installing dependencies..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green

# Check if .env.local exists
Write-Host "`n🔧 Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local not found - creating from template..." -ForegroundColor Yellow
    
    $envContent = @"
NEXT_PUBLIC_APP_NAME="HeartShare"
NEXT_PUBLIC_API_BASE="/api"
NEXT_PUBLIC_STUN="stun:stun.l.google.com:19302"
TURN_URL=turn:your-turn-server:3478
TURN_USER=turnuser
TURN_PASS=turnpass
PORT=3000
"@
    
    Set-Content -Path ".env.local" -Value $envContent
    Write-Host "✅ Created .env.local with default settings" -ForegroundColor Green
}

# Summary
Write-Host "`n🎉 Setup Complete!" -ForegroundColor Cyan
Write-Host "================`n" -ForegroundColor Cyan

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Run:  npm run dev" -ForegroundColor White
Write-Host "   2. Open: http://localhost:3000" -ForegroundColor White
Write-Host "   3. Test with two browser windows!`n" -ForegroundColor White

Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - README.md               - Full documentation" -ForegroundColor White
Write-Host "   - QUICKSTART.md           - Quick start guide" -ForegroundColor White
Write-Host "   - BROWSER_COMPATIBILITY.md - Browser support info`n" -ForegroundColor White

Write-Host "💡 For production deployment:" -ForegroundColor Yellow
Write-Host "   - Configure a TURN server (see README.md)" -ForegroundColor White
Write-Host "   - Update .env.local with your TURN credentials" -ForegroundColor White
Write-Host "   - Deploy to Vercel, Railway, or your hosting provider`n" -ForegroundColor White

Write-Host "🚀 Ready to start? Run: npm run dev" -ForegroundColor Green
